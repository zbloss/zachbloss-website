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
  | { type: "stub"; message: string };

/** Definition of a known command — used by HelpOutput and routing. */
export interface CommandDefinition {
  command: string;
  description: string;
  route?: string;
  action?: "clear";
}

/**
 * All known commands the terminal recognises.
 * Each entry maps to a URL route (or a special action).
 */
export const KNOWN_COMMANDS: CommandDefinition[] = [
  { command: "/help", description: "Show available commands", route: "/help" },
  { command: "/clear", description: "Clear terminal output", action: "clear" },
];

/** Resolve a raw input string to a CommandResult. */
export function resolveCommand(input: string): CommandResult {
  const trimmed = input.trim();

  // Plain text (no / prefix) or empty → stub
  if (!trimmed.startsWith("/")) {
    return {
      type: "stub",
      message:
        "Plain text input handling coming soon — try /help to see available commands",
    };
  }

  const cmd = trimmed.slice(1).toLowerCase();

  const found = KNOWN_COMMANDS.find(
    (c) => c.command.slice(1).toLowerCase() === cmd
  );

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
