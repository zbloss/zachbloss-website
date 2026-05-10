/**
 * CommandRouter — resolves raw terminal input to an action.
 *
 * Known `/` commands navigate to their route or perform an action.
 * Unknown commands and plain text return error/stub results.
 */

import type { CommandDefinition } from "./commandTypes";

export type CommandResult =
  | { type: "navigate"; route: string }
  | { type: "clear" }
  | { type: "error"; message: string }
  | { type: "stub"; message: string }
  | { type: "suggest"; command: string; message: string };

/**
 * All known commands the terminal recognises.
 * Each entry maps to a URL route (or a special action).
 */
export const KNOWN_COMMANDS: CommandDefinition[] = [
  {
    command: "/home",
    description: "Return to the home page",
    route: "/",
    aliases: ["home", "homepage", "main", "index", "start", "go home", "return home", "back to home"],
  },
  {
    command: "/help",
    description: "Show available commands",
    route: "/help",
    aliases: ["help", "commands", "list commands", "what can you do", "options", "show commands", "show me commands", "available commands"],
  },
  {
    command: "/about",
    description: "View background and skills",
    route: "/about",
    aliases: ["about", "about me", "about you", "who are you", "background", "skills", "bio", "tell me about yourself", "introduce yourself"],
  },
  {
    command: "/projects",
    description: "View portfolio projects",
    route: "/projects",
    aliases: ["projects", "portfolio", "work", "show projects", "show me projects", "what have you built", "your projects", "view projects"],
  },
  {
    command: "/certifications",
    description: "View professional certifications",
    route: "/certifications",
    aliases: ["certifications", "certificates", "certs", "credentials", "qualifications", "show certifications", "show certs", "your certifications"],
  },
  {
    command: "/blog",
    description: "View blog posts",
    route: "/blog",
    aliases: ["blog", "blog posts", "posts", "articles", "writing", "show blog", "show me blog", "show me blog posts", "your blog", "view blog"],
  },
  {
    command: "/latest",
    description: "View recent commits",
    route: "/latest",
    aliases: ["latest", "recent", "commits", "recent commits", "git commits", "updates", "show latest", "show commits", "what's new"],
  },
  {
    command: "/contact",
    description: "Get in touch via message form",
    route: "/contact",
    aliases: ["contact", "contact me", "get in touch", "message", "email", "reach out", "send a message", "contact form", "reach me"],
  },
  {
    command: "/clear",
    description: "Clear terminal output",
    action: "clear",
    aliases: ["clear", "clear screen", "reset", "clean", "clear terminal", "wipe", "clear the screen", "cls"],
  },
];

/**
 * Normalize a command string for comparison: strip the leading `/` and lowercase.
 * " /help" → "help", " /Projects" → "projects"
 */
function normalizeCommand(input: string): string {
  return input.trim().toLowerCase().replace(/^\//, "");
}

/**
 * Find a command definition matching the trimmed input (case-insensitive, ignoring the leading `/`).
 */
function findCommand(
  commands: CommandDefinition[],
  trimmed: string,
): CommandDefinition | undefined {
  const normalizedInput = normalizeCommand(trimmed);
  return commands.find((c) => normalizeCommand(c.command) === normalizedInput);
}

/** Resolve a raw input string to a CommandResult. */
export function resolveCommand(input: string): CommandResult {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return {
      type: "stub",
      message:
        "Plain text input handling coming soon — try /help to see available commands",
    };
  }

  const found = findCommand(KNOWN_COMMANDS, trimmed);
  if (!found) {
    return { type: "error", message: `Unknown command: ${trimmed}` };
  }

  return commandToResult(found);
}

// ---------------------------------------------------------------------------
// Async resolution — wires IntentResolver into CommandRouter
// ---------------------------------------------------------------------------

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MID_CONFIDENCE_THRESHOLD = 0.50;
const NO_MATCH_MESSAGE = "I'm not sure what you mean — try /help to see available commands";

/**
 * Resolve a CommandDefinition to a CommandResult based on its action/route.
 */
function commandToResult(cmd: CommandDefinition): CommandResult {
  if (cmd.action === "clear") {
    return { type: "clear" };
  }
  return { type: "navigate", route: cmd.route ?? cmd.command };
}

/**
 * Resolve input asynchronously, wiring IntentResolver for plain text
 * and unknown commands.
 *
 * Confidence thresholds:
 *   ≥ 0.85 → auto-navigate
 *   0.50–0.84 → suggest command for confirmation
 *   < 0.50 → display "try /help" message
 */
export async function resolveCommandAsync(
  input: string,
  commands: CommandDefinition[],
): Promise<CommandResult> {
  const trimmed = input.trim();

  // Known `/` commands resolve synchronously (fast path)
  if (trimmed.startsWith("/")) {
    const found = findCommand(commands, trimmed);
    if (found) {
      return commandToResult(found);
    }
  }

  // Plain text or unknown `/` command → IntentResolver (slow path)
  const { getIntentResolver } = await import("@/app/lib/intentResolver");
  const resolver = getIntentResolver(commands);

  if (!resolver.isReady()) {
    return {
      type: "stub",
      message:
        "Assistant is loading… try /help to see available commands",
    };
  }

  const intentResult = await resolver.resolve(trimmed);

  if (intentResult) {
    if (intentResult.confidence >= HIGH_CONFIDENCE_THRESHOLD) {
      const matchedCmd = commands.find(
        (c) => c.command === intentResult.command,
      );
      if (matchedCmd) {
        return commandToResult(matchedCmd);
      }
      return { type: "navigate", route: intentResult.command };
    }

    if (intentResult.confidence >= MID_CONFIDENCE_THRESHOLD) {
      return {
        type: "suggest",
        command: intentResult.command,
        message: `I think you mean ${intentResult.command} (confidence: ${intentResult.confidence.toFixed(2)}). Type it to confirm.`,
      };
    }
  }

  return { type: "stub", message: NO_MATCH_MESSAGE };
}

