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
  // Command history for the session.
  const [history, setHistory] = useState<string[]>([]);
  // Current browsing position in history (−1 = at prompt).
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Error or stub message to show in the TerminalBody.
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the input after route changes.
  useEffect(() => {
    inputRef.current?.focus();
  });

  const handleCommand = useCallback((command: string) => {
    const result = resolveCommand(command);

    // Add to history (unless it's an error/stub message).
    if (result.type !== "error" && result.type !== "stub") {
      setHistory((prev) => [...prev, command]);
    }

    switch (result.type) {
      case "navigate":
        setHistoryIndex(-1);
        router.push(result.route);
        break;

      case "clear":
        // /clear navigates to the /clear route which renders an empty body.
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
      {/* Terminal Header */}
      <div className="border-t-2 border-lime-500">
        ┌ Terminal ── zachbloss.com ──┐
      </div>

      {/* Terminal Body — scrollable output area */}
      <div role="log" className="overflow-y-auto flex-grow p-2 min-h-[calc(100vh-80px)]">
        {children}
        {message && (
          <div className="text-gray-400 mt-2" aria-live="polite">
            {message}
          </div>
        )}
      </div>

      {/* Terminal Prompt */}
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
