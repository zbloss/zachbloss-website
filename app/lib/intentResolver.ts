/**
 * IntentResolver — in-browser embedding similarity for intent resolution.
 *
 * Wraps Xenova/all-MiniLM-L6-v2 via Transformers.js to map plain-text input
 * to the closest Command via cosine similarity.
 *
 * Model loading begins 3 seconds after page load via low-priority background fetch.
 * With the real model, one embedding is computed per command from all anchor texts.
 * With the word-bag fallback, one embedding is computed per anchor text, and the
 * resolver takes the maximum similarity across all anchors per command.
 */

import type { CommandDefinition } from "./commandTypes";

// ---------------------------------------------------------------------------
// Cosine similarity utility
// ---------------------------------------------------------------------------

/**
 * Compute cosine similarity between two vectors.
 * Returns a value in [-1, 1]. Zero for empty vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0.0;

  const len = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0.0;

  return dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// Text embedding (portable fallback — used when Transformers.js unavailable)
// ---------------------------------------------------------------------------

/**
 * Simple word-bag embedding for portability.
 * Used as a fallback when Transformers.js cannot load (tests, offline).
 * Creates a fixed-length vector based on character trigrams.
 */
export function wordBagEmbedding(text: string, dim: number): number[] {
  const vec = new Array(dim).fill(0);
  const normalized = text.toLowerCase().trim();
  const n = 3;
  for (let i = 0; i <= normalized.length - n; i++) {
    const gram = normalized.substring(i, i + n);
    let hash = 0;
    for (let j = 0; j < gram.length; j++) {
      hash = (hash * 31 + gram.charCodeAt(j)) % dim;
    }
    vec[hash] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

// ---------------------------------------------------------------------------
// Anchor text builder
// ---------------------------------------------------------------------------

/**
 * Build the list of anchor texts for a command.
 * Includes the bare command name, description, and all aliases.
 * Used to build per-anchor word-bag embeddings (fallback) and
 * the concatenated text for the real model.
 */
function buildAnchorTexts(cmd: CommandDefinition): string[] {
  return [
    cmd.command.slice(1), // command name without /
    cmd.description,
    ...(cmd.aliases ?? []),
  ].filter(Boolean);
}

// ---------------------------------------------------------------------------
// IntentResolver class
// ---------------------------------------------------------------------------

export interface IntentResult {
  command: string;
  confidence: number;
}

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIM = 384;
const DEFAULT_MODEL_LOAD_DELAY_MS = 3000;

/** Override model load delay — set via `window.__MODEL_LOAD_DELAY_MS__` in tests. */
const MODEL_LOAD_DELAY_MS =
  typeof window !== "undefined" &&
  typeof (window as Record<string, unknown>)["__MODEL_LOAD_DELAY_MS__"] === "number"
    ? (window as Record<string, unknown>)["__MODEL_LOAD_DELAY_MS__"] as number
    : DEFAULT_MODEL_LOAD_DELAY_MS;

export class IntentResolver {
  private commands: CommandDefinition[];
  /**
   * Multiple anchor embeddings per command.
   * Real model: [[single embedding from concatenated text]].
   * Word-bag fallback: [[emb_anchor1], [emb_anchor2], ...].
   */
  private anchorEmbeddings: Map<string, number[][]> = new Map();
  private modelReady: boolean = false;
  private modelPromise: Promise<void> | null = null;
  private loadDelay: number;
  /** True after model fails to load — input embeddings use word-bag directly. */
  private usingWordBagFallback: boolean = false;

  /** Injected mock embedding function — used in tests. */
  private mockInputEmbedding: ((text: string) => number[]) | null = null;
  /** Pre-set command embeddings for tests (single vector per command). */
  private mockCommandEmbeddings: Map<string, number[]> | null = null;

  constructor(commands: CommandDefinition[], loadDelay?: number) {
    this.commands = commands;
    this.loadDelay = loadDelay ?? MODEL_LOAD_DELAY_MS;
    this.modelPromise = this.initModel();
  }

  /** Inject mock embeddings for testing (bypasses real model loading). */
  setMockEmbeddings(
    inputFn: (text: string) => number[],
    commandEmbeddings: Map<string, number[]>,
  ): void {
    this.mockInputEmbedding = inputFn;
    this.mockCommandEmbeddings = commandEmbeddings;
    this.modelReady = true;
    this.modelPromise = null;
  }

  /** Check if the model is loaded and ready for resolution. */
  isReady(): boolean {
    return this.modelReady;
  }

  /**
   * Resolve user input to the best-matching command.
   * Returns the command with the highest confidence score,
   * or null if no meaningful match exists (all confidences are 0).
   *
   * Confidence thresholds are applied by the caller (e.g. resolveCommandAsync):
   *   ≥ 0.85 → auto-navigate
   *   0.50–0.84 → suggest
   *   < 0.50 → try /help
   */
  async resolve(input: string): Promise<IntentResult | null> {
    if (this.modelPromise) {
      await this.modelPromise;
    }

    const inputEmbedding = await this.getInputEmbedding(input);

    let bestCommand: IntentResult | null = null;

    for (const cmd of this.commands) {
      const anchors = this.getCommandAnchors(cmd);
      let maxConfidence = 0;
      for (const anchor of anchors) {
        const sim = cosineSimilarity(inputEmbedding, anchor);
        if (sim > maxConfidence) maxConfidence = sim;
      }
      if (maxConfidence > 0 && (!bestCommand || maxConfidence > bestCommand.confidence)) {
        bestCommand = { command: cmd.command, confidence: maxConfidence };
      }
    }

    return bestCommand;
  }

  /** Get embedding for input text — mock, model, word-bag fallback, or on-the-fly. */
  private async getInputEmbedding(text: string): Promise<number[]> {
    if (this.mockInputEmbedding) {
      return this.mockInputEmbedding(text);
    }
    if (this.usingWordBagFallback) {
      return wordBagEmbedding(text, EMBEDDING_DIM);
    }
    if (this.modelReady && this.anchorEmbeddings.size > 0) {
      return this.modelEmbedding(text);
    }
    return wordBagEmbedding(text, EMBEDDING_DIM);
  }

  /**
   * Get anchor embeddings for a command.
   * Mock: wraps the single mock vector in an array.
   * Real/fallback: returns all pre-computed anchor embeddings.
   * On-the-fly: computes word-bag for each anchor text (safety net).
   */
  private getCommandAnchors(cmd: CommandDefinition): number[][] {
    if (this.mockCommandEmbeddings && this.mockCommandEmbeddings.has(cmd.command)) {
      return [this.mockCommandEmbeddings.get(cmd.command)!];
    }
    if (this.anchorEmbeddings.has(cmd.command)) {
      return this.anchorEmbeddings.get(cmd.command)!;
    }
    return buildAnchorTexts(cmd).map((t) => wordBagEmbedding(t, EMBEDDING_DIM));
  }

  /** Use Transformers.js pipeline if available. */
  private async modelEmbedding(text: string): Promise<number[]> {
    try {
      const { pipeline } = await import("@xenova/transformers");
      const embedder = await pipeline("feature-extraction", MODEL_ID);
      const output = await embedder(text, { pooling: "mean", normalize: true });
      const data = output.data as number[];
      return Array.from(data) as number[];
    } catch {
      return wordBagEmbedding(text, EMBEDDING_DIM);
    }
  }

  /**
   * Initialize the model: start loading after a delay,
   * pre-compute embeddings for all commands.
   *
   * Real model: one embedding per command from concatenated anchor texts.
   * Fallback: one word-bag embedding per anchor text per command.
   */
  private async initModel(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.loadDelay));

    try {
      const { pipeline } = await import("@xenova/transformers");
      const embedder = await pipeline("feature-extraction", MODEL_ID);

      for (const cmd of this.commands) {
        const text = buildAnchorTexts(cmd).join(" ");
        const output = await embedder(text, { pooling: "mean", normalize: true });
        const data = output.data as number[];
        this.anchorEmbeddings.set(cmd.command, [Array.from(data)]);
      }

      this.modelReady = true;
    } catch {
      // Model failed to load — use per-anchor word-bag embeddings.
      // Each anchor is embedded separately so short inputs match their
      // exact alias rather than competing against the full description.
      this.usingWordBagFallback = true;
      for (const cmd of this.commands) {
        const anchors = buildAnchorTexts(cmd).map((t) => wordBagEmbedding(t, EMBEDDING_DIM));
        this.anchorEmbeddings.set(cmd.command, anchors);
      }
      this.modelReady = true;
    }

    this.modelPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Global singleton (used by TerminalLayout for real-time resolution)
// ---------------------------------------------------------------------------

let instance: IntentResolver | null = null;

/**
 * Get the global IntentResolver singleton.
 * Creates one if not yet initialized.
 */
export function getIntentResolver(commands: CommandDefinition[]): IntentResolver {
  if (!instance) {
    instance = new IntentResolver(commands);
  }
  return instance;
}

/**
 * Convenience function to resolve input to a command.
 * Creates a new resolver if none exists yet.
 */
export async function resolve(
  commands: CommandDefinition[],
  input: string,
): Promise<IntentResult | null> {
  const resolver = getIntentResolver(commands);
  return resolver.resolve(input);
}
