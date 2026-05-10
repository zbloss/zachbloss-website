"use client";

import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

export function HelpOutput() {
  return (
    <div className="help-output space-y-2 overflow-hidden" role="region" aria-label="Available commands">
      <div className="text-purple-400 font-bold text-lg truncate">
        ┌ Available Commands ─────────────────┐
      </div>
      <div className="pl-2 space-y-1">
        {KNOWN_COMMANDS.map((cmd) => (
          <div key={cmd.command} className="flex flex-col sm:flex-row gap-1">
            <span className="text-lime-400 font-bold shrink-0">
              {cmd.command}
            </span>
            <span className="text-gray-300 break-words">{cmd.description}</span>
          </div>
        ))}
      </div>
      <div className="text-gray-500 pl-2 truncate">
        └─────────────────────────────────────┘
      </div>
    </div>
  );
}
