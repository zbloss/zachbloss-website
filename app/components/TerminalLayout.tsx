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
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile viewport using matchMedia (SSR-safe via useEffect).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  });

  // Apply a CommandResult — navigate, clear, or display a message.
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

    // Empty input → clear message
    if (!trimmed) {
      setMessage(null);
      return;
    }

    // Always record the command in history before processing
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Fast path: known commands resolve synchronously
    const syncResult = resolveCommand(trimmed);
    if (syncResult.type === "navigate" || syncResult.type === "clear") {
      applyResult(syncResult);
      return;
    }

    // Slow path: IntentResolver for plain text and unknown commands
    const result = await resolveCommandAsync(trimmed, KNOWN_COMMANDS);
    applyResult(result);
  }, [applyResult]);

  return (
    <div className="terminal-layout font-mono min-h-screen bg-black text-green-400 p-4 flex flex-col">
      <div className="border-t-2 border-lime-500">
        ┌ Terminal ── zachbloss.com ──┐
        <span className="float-right">
          <AssistantStatus />
        </span>
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
        <MobileCommandShortcuts onCommand={handleCommand} isMobile={isMobile} />
        <TerminalPrompt
          onCommand={handleCommand}
          history={history}
          historyIndex={historyIndex}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
