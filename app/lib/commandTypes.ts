/**
 * Shared types for command routing and intent resolution.
 * Extracted to avoid circular dependencies between
 * commandRouter.ts and intentResolver.ts.
 */

/** Definition of a known command — used by HelpOutput, CommandRouter, and IntentResolver. */
export interface CommandDefinition {
  command: string;
  description: string;
  route?: string;
  action?: "clear";
  /** Plain-text phrases users might type that should map to this command. */
  aliases?: string[];
}
