"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resolveCommand, resolveCommandAsync } from "@/app/lib/commandRouter";
import { TerminalPrompt } from "@/app/components/TerminalPrompt";
import { AssistantStatus } from "@/app/components/AssistantStatus";
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

  useEffect(() => {
    inputRef.current?.focus();
  });

  const handleCommand = useCallback(async (command: string) => {
    const trimmed = command.trim();

    // Empty input → clear message
    if (!trimmed) {
      setMessage(null);
      return;
    }

    // Fast path: known commands resolve synchronously
    const syncResult = resolveCommand(trimmed);
    if (syncResult.type === "navigate" || syncResult.type === "clear") {
      setHistory((prev) => [...prev, command]);
      setHistoryIndex(-1);
      switch (syncResult.type) {
        case "navigate":
          router.push(syncResult.route);
          break;
        case "clear":
          router.push("/clear");
          break;
      }
      return;
    }

    // Unknown commands → async resolution with IntentResolver wiring
    const result = await resolveCommandAsync(trimmed, KNOWN_COMMANDS);

    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    switch (result.type) {
      case "navigate":
        router.push(result.route);
        break;
      case "clear":
        router.push("/clear");
        break;
      case "suggest":
        setMessage(result.message);
        break;
      case "stub":
        setMessage(result.message);
        break;
      case "error":
        setMessage(result.message);
        break;
    }
  }, [router]);

  return (
    <div className="terminal-layout font-mono min-h-screen bg-black text-green-400 p-4 flex flex-col">
      <div className="border-t-2 border-lime-500">
        ┌ Terminal ── zachbloss.com ──┐
        <span className="float-right">
          <AssistantStatus />
        </span>
      </div>

      <div role="log" className="overflow-y-auto flex-grow p-2 min-h-[calc(100vh-80px)]">
        {children}
        {message && (
          <div className="text-gray-400 mt-2" aria-live="polite">
            {message}
          </div>
        )}
      </div>

      <div className="border-b-2 border-lime-500 p-2">
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
