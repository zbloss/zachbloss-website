"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resolveCommand, resolveCommandAsync, CommandResult } from "@/app/lib/commandRouter";
import { TerminalPrompt } from "@/app/components/TerminalPrompt";
import { AssistantStatus } from "@/app/components/AssistantStatus";
import { MobileCommandShortcuts } from "@/app/components/MobileCommandShortcuts";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export function TerminalLayout({ children }: TerminalLayoutProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  });

  const applyResult = useCallback(
    (result: CommandResult) => {
      switch (result.type) {
        case "navigate":
          router.push(result.route);
          break;
        case "clear":
          router.push("/clear");
          break;
        case "suggest":
        case "stub":
        case "error":
          setMessage(result.message);
          break;
      }
    },
    [router, setMessage],
  );

  const handleCommand = useCallback(async (command: string) => {
    const trimmed = command.trim();

    if (!trimmed) {
      setMessage(null);
      return;
    }

    setHistory((prev) => [...prev, command]);

    const syncResult = resolveCommand(trimmed);
    if (syncResult.type === "navigate" || syncResult.type === "clear") {
      applyResult(syncResult);
      return;
    }

    const result = await resolveCommandAsync(trimmed, KNOWN_COMMANDS);
    applyResult(result);
  }, [applyResult]);

  return (
    <div className="terminal-layout font-mono h-screen overflow-hidden bg-black text-green-400 p-4 flex flex-col">
      <div className="border-t-2 border-lime-500 flex items-center justify-between truncate px-1">
        <span className="shrink-0">┌ Terminal ── zachbloss.com ──┐</span>
        <AssistantStatus />
      </div>

      <div role="log" className="overflow-y-auto flex-grow p-2 flex flex-col">
        <div className="flex-grow" />
        {children}
        {message && (
          <div className="text-gray-400 mt-2" aria-live="polite">
            {message}
          </div>
        )}
      </div>

      <div className="border-b-2 border-lime-500 p-2">
        <MobileCommandShortcuts onCommand={handleCommand} />
        <TerminalPrompt
          onCommand={handleCommand}
          history={history}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
