"use client";

import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

interface MobileCommandShortcutsProps {
  /** Called with the command string when a shortcut button is tapped. */
  onCommand: (command: string) => void;
  /** Whether the current viewport is mobile-sized. When false, nothing renders. */
  isMobile?: boolean;
}

/**
 * Renders a horizontally scrollable row of command shortcut buttons.
 * Only visible on mobile viewports (controlled by `isMobile` prop).
 * Each button triggers `onCommand` with the corresponding command string.
 */
export function MobileCommandShortcuts({
  onCommand,
  isMobile = false,
}: MobileCommandShortcutsProps) {
  if (!isMobile) {
    return null;
  }

  return (
    <div className="mobile-shortcut-row overflow-x-auto flex gap-2 p-2 whitespace-nowrap">
      {KNOWN_COMMANDS.map((cmd) => (
        <button
          key={cmd.command}
          onClick={() => onCommand(cmd.command)}
          className="px-3 py-1.5 text-sm font-mono border border-lime-500/50 text-lime-400 rounded hover:bg-lime-500/20 hover:border-lime-400 active:bg-lime-500/30 transition-colors"
        >
          {cmd.command}
        </button>
      ))}
    </div>
  );
}
