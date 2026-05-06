/**
 * IntentResolver — in-browser embedding similarity for intent resolution.
 *
 * Wraps Xenova/all-MiniLM-L6-v2 via Transformers.js to map plain-text input
 * to the closest Command via cosine similarity.
 *
 * Model loading begins 3 seconds after page load via low-priority background fetch.
 * Command embeddings are pre-computed at init time (not per query).
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
function wordBagEmbedding(text: string, dim: number = 64): number[] {
  const vec = new Array(dim).fill(0);
  const normalized = text.toLowerCase().trim();
  // Use character n-grams for a simple but meaningful embedding
  const n = 3;
  for (let i = 0; i <= normalized.length - n; i++) {
    const gram = normalized.substring(i, i + n);
    // Hash the n-gram to a vector index
    let hash = 0;
    for (let j = 0; j < gram.length; j++) {
      hash = (hash * 31 + gram.charCodeAt(j)) % dim;
    }
    vec[hash] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
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

/** Override model load delay — set via vitest globals in tests. */
const MODEL_LOAD_DELAY_MS = typeof window !== "undefined"
  ? ((window as unknown as Record<string, unknown>)["__MODEL_LOAD_DELAY_MS__"] as number) ?? DEFAULT_MODEL_LOAD_DELAY_MS
  : DEFAULT_MODEL_LOAD_DELAY_MS;

export class IntentResolver {
  private commands: CommandDefinition[];
  private embeddings: Map<string, number[]> = new Map();
  private modelReady: boolean = false;
  private modelPromise: Promise<void> | null = null;
  private loadDelay: number;

  /** Injected mock embedding function — used in tests. */
  private mockInputEmbedding: ((text: string) => number[]) | null = null;
  /** Pre-set command embeddings for tests. */
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
    // Wait for model if not ready yet
    if (this.modelPromise) {
      await this.modelPromise;
    }

    const inputEmbedding = await this.getInputEmbedding(input);

    let bestCommand: IntentResult | null = null;

    for (const cmd of this.commands) {
      const cmdEmbedding = this.getCommandEmbedding(cmd.command, cmd.description);
      const confidence = cosineSimilarity(inputEmbedding, cmdEmbedding);

      if (confidence > 0 && (!bestCommand || confidence > bestCommand.confidence)) {
        bestCommand = { command: cmd.command, confidence };
      }
    }

    return bestCommand;
  }

  /** Get embedding for input text — uses mock if injected, falls back to model/word-bag. */
  private async getInputEmbedding(text: string): Promise<number[]> {
    if (this.mockInputEmbedding) {
      return this.mockInputEmbedding(text);
    }
    if (this.modelReady && this.embeddings.size > 0) {
      return this.modelEmbedding(text);
    }
    return wordBagEmbedding(text, EMBEDDING_DIM);
  }

  /** Get cached command embedding — uses mock if injected. */
  private getCommandEmbedding(command: string, description: string): number[] {
    if (this.mockCommandEmbeddings && this.mockCommandEmbeddings.has(command)) {
      return this.mockCommandEmbeddings.get(command)!;
    }
    return this.embeddings.get(command) || wordBagEmbedding(description || command, EMBEDDING_DIM);
  }

  /** Use Transformers.js pipeline if available. */
  private async modelEmbedding(text: string): Promise<number[]> {
    // Dynamic import — only loads in browser context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { pipeline } = await import("@xenova/transformers");
    try {
      const embedder = await pipeline("feature-extraction", MODEL_ID);
      const output = await embedder(text, { pooling: "mean", normalize: true });
      const data = output.data as number[];
      return Array.from(data) as number[];
    } catch {
      // If model fails, fall back to word-bag
      return wordBagEmbedding(text, EMBEDDING_DIM);
    }
  }

  /**
   * Initialize the model: start loading after a 3-second delay,
   * pre-compute embeddings for all commands.
   */
  private async initModel(): Promise<void> {
    // Low-priority background load — schedule after page load
    await new Promise((resolve) => setTimeout(resolve, this.loadDelay));

    try {
      const { pipeline } = await import("@xenova/transformers");
      const embedder = await pipeline("feature-extraction", MODEL_ID);

      // Pre-compute embeddings for each command description
      for (const cmd of this.commands) {
        const text = cmd.description || cmd.command;
        const output = await embedder(text, { pooling: "mean", normalize: true });
        const data = output.data as number[];
        this.embeddings.set(cmd.command, Array.from(data));
      }

      this.modelReady = true;
    } catch {
      // Model failed to load — fall back to word-bag embeddings
      this.modelReady = true;
      for (const cmd of this.commands) {
        const text = cmd.description || cmd.command;
        this.embeddings.set(cmd.command, wordBagEmbedding(text, EMBEDDING_DIM));
      }
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
