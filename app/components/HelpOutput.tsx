"use client";

import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

export function HelpOutput() {
  return (
    <div className="help-output space-y-2" role="region" aria-label="Available commands">
      <div className="text-purple-400 font-bold text-lg">
        ┌ Available Commands ─────────────────┐
      </div>
      <div className="pl-2 space-y-1">
        {KNOWN_COMMANDS.map((cmd) => (
          <div key={cmd.command} className="flex gap-4">
            <span className="text-lime-400 font-bold min-w-[100px]">
              {cmd.command}
            </span>
            <span className="text-gray-300">{cmd.description}</span>
          </div>
        ))}
      </div>
      <div className="text-gray-500 pl-2">
        └─────────────────────────────────────┘
      </div>
    </div>
  );
}
