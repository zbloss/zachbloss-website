/**
 * CommandRouter — resolves raw terminal input to an action.
 *
 * Known `/` commands navigate to their route or perform an action.
 * Unknown commands and plain text return error/stub results.
 */

export type CommandResult =
  | { type: "navigate"; route: string }
  | { type: "clear" }
  | { type: "error"; message: string }
  | { type: "stub"; message: string }
  | { type: "suggest"; command: string; message: string };

export type { CommandDefinition } from "./commandTypes";
import type { CommandDefinition } from "./commandTypes";

/**
 * All known commands the terminal recognises.
 * Each entry maps to a URL route (or a special action).
 */
export const KNOWN_COMMANDS: CommandDefinition[] = [
  { command: "/help", description: "Show available commands", route: "/help" },
  { command: "/about", description: "View background and skills", route: "/about" },
  { command: "/projects", description: "View portfolio projects", route: "/projects" },
  { command: "/certifications", description: "View professional certifications", route: "/certifications" },
  { command: "/clear", description: "Clear terminal output", action: "clear" },
];

/** Resolve a raw input string to a CommandResult. */
export function resolveCommand(input: string): CommandResult {
  const trimmed = input.trim();

  // Plain text (no / prefix) or empty string → stub
  if (!trimmed.startsWith("/")) {
    return {
      type: "stub",
      message:
        "Plain text input handling coming soon — try /help to see available commands",
    };
  }

  const cmd = trimmed.slice(1).toLowerCase();

  const found = KNOWN_COMMANDS.find((c) => c.command.slice(1).toLowerCase() === cmd);

  if (!found) {
    return { type: "error", message: `Unknown command: ${trimmed}` };
  }

  if (found.action === "clear") {
    return { type: "clear" };
  }

  if (found.route) {
    return { type: "navigate", route: found.route };
  }

  // Should not happen, but be safe
  return {
    type: "error",
    message: `Unknown command: ${trimmed}`,
  };
}

// ---------------------------------------------------------------------------
// Async resolution — wires IntentResolver into CommandRouter
// ---------------------------------------------------------------------------

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MID_CONFIDENCE_THRESHOLD = 0.50;

/**
 * Resolve input asynchronously, wiring IntentResolver for plain text
 * and unknown commands.
 *
 * Flow:
 *   1. Known `/` commands → direct result (sync)
 *   2. Plain text / unknown `/` → IntentResolver
 *   3. Confidence ≥ 0.85 → navigate
 *   4. Confidence 0.50–0.84 → suggest + await confirmation
 *   5. Confidence < 0.50 → try /help message
 */
export async function resolveCommandAsync(
  input: string,
  commands: CommandDefinition[],
): Promise<CommandResult> {
  const trimmed = input.trim();

  // Fast path: known commands resolve synchronously
  if (trimmed.startsWith("/")) {
    const cmd = trimmed.slice(1).toLowerCase();
    const found = commands.find(
      (c) => c.command.slice(1).toLowerCase() === cmd,
    );
    if (found) {
      if (found.action === "clear") {
        return { type: "clear" };
      }
      if (found.route) {
        return { type: "navigate", route: found.route };
      }
    }
  }

  // Plain text or unknown /command → IntentResolver
  const { getIntentResolver } = await import("@/app/lib/intentResolver");
  const resolver = getIntentResolver(commands);

  if (!resolver.isReady()) {
    // Model not ready yet — fall back to stub
    return {
      type: "stub",
      message:
        "Assistant is loading… try /help to see available commands",
    };
  }

  const intentResult = await resolver.resolve(trimmed);

  if (intentResult) {
    if (intentResult.confidence >= HIGH_CONFIDENCE_THRESHOLD) {
      // Auto-navigate to matched command
      const matchedCmd = commands.find(
        (c) => c.command === intentResult.command,
      );
      if (matchedCmd) {
        if (matchedCmd.action === "clear") {
          return { type: "clear" };
        }
        if (matchedCmd.route) {
          return { type: "navigate", route: matchedCmd.route };
        }
      }
      // Fallback: navigate by command name
      return { type: "navigate", route: intentResult.command };
    }

    if (intentResult.confidence >= MID_CONFIDENCE_THRESHOLD) {
      // Suggest and await confirmation
      return {
        type: "suggest",
        command: intentResult.command,
        message: `I think you mean ${intentResult.command} (confidence: ${intentResult.confidence.toFixed(2)}). Type it to confirm.`,
      };
    }
  }

  // Below threshold — suggest /help
  return {
    type: "stub",
    message: "I'm not sure what you mean — try /help to see available commands",
  };
}
