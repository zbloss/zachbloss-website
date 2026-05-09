"use client";

import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

interface MobileCommandShortcutsProps {
  onCommand: (command: string) => void;
  isMobile?: boolean;
}

/** Command shortcut buttons for mobile viewports. */
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
