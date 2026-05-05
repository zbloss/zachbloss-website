"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resolveCommand } from "@/app/lib/commandRouter";
import { TerminalPrompt } from "@/app/components/TerminalPrompt";

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

  const handleCommand = useCallback((command: string) => {
    const result = resolveCommand(command);

    // Don't add error or stub commands to history.
    if (result.type !== "error" && result.type !== "stub") {
      setHistory((prev) => [...prev, command]);
    }

    switch (result.type) {
      case "navigate":
        setHistoryIndex(-1);
        router.push(result.route);
        break;

      case "clear":
        setHistoryIndex(-1);
        router.push("/clear");
        break;

      case "error":
        setMessage(result.message);
        break;

      case "stub":
        setMessage(result.message);
        break;
    }
  }, [router]);

  return (
    <div className="terminal-layout font-mono min-h-screen bg-black text-green-400 p-4 flex flex-col">
      <div className="border-t-2 border-lime-500">
        ┌ Terminal ── zachbloss.com ──┐
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
