"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resolveCommand, CommandResult } from "@/app/lib/commandRouter";
import { TerminalPrompt } from "@/app/components/TerminalPrompt";
import { AssistantStatus } from "@/app/components/AssistantStatus";
import { resolve } from "@/app/lib/intentResolver";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

interface TerminalLayoutProps {
  children: React.ReactNode;
}

/**
 * Route a plain-text input through the IntentResolver and apply confidence thresholds.
 *
 * Confidence thresholds (per PRD):
 *   ≥ 0.85 → auto-navigate to the matched command
 *   0.50–0.84 → suggest the command and await confirmation
 *   < 0.50 → print "try /help"
 */
function routeIntent(input: string): Promise<CommandResult> {
  return resolve(KNOWN_COMMANDS, input).then((result) => {
    if (result) {
      if (result.confidence >= 0.85) {
        // Auto-navigate to matched command
        const cmd = KNOWN_COMMANDS.find((c) => c.command === result.command);
        if (cmd) {
          if (cmd.action === "clear") {
            return { type: "clear" };
          }
          if (cmd.route) {
            return { type: "navigate", route: cmd.route };
          }
        }
        // Fallback: navigate by command name
        return { type: "navigate", route: result.command };
      }

      if (result.confidence >= 0.50) {
        // Suggest and await confirmation
        return {
          type: "stub",
          message: `I think you mean ${result.command} (confidence: ${result.confidence.toFixed(2)}). Type it to confirm.`,
        };
      }
    }

    // Below threshold — suggest /help
    return {
      type: "stub",
      message: "I'm not sure what you mean — try /help to see available commands",
    };
  });
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

    // First try known command routing
    const knownResult = resolveCommand(trimmed);

    if (knownResult.type === "navigate" || knownResult.type === "clear") {
      // Known command — execute directly
      setHistory((prev) => [...prev, command]);
      switch (knownResult.type) {
        case "navigate":
          setHistoryIndex(-1);
          router.push(knownResult.route);
          break;
        case "clear":
          setHistoryIndex(-1);
          router.push("/clear");
          break;
      }
      return;
    }

    // Unknown command or plain text → IntentResolver
    if (!trimmed) {
      setMessage(null);
      return;
    }

    // For plain text (no / prefix) or unknown /command, use IntentResolver
    if (!trimmed.startsWith("/")) {
      const intentResult = await routeIntent(trimmed);

      setHistory((prev) => [...prev, command]);

      switch (intentResult.type) {
        case "navigate":
          setHistoryIndex(-1);
          router.push(intentResult.route);
          break;
        case "clear":
          setHistoryIndex(-1);
          router.push("/clear");
          break;
        case "stub":
          setMessage(intentResult.message);
          break;
        default:
          setMessage("Unknown command — try /help");
      }
      return;
    }

    // Unknown /command — delegate to IntentResolver for potential match
    const intentResult = await routeIntent(trimmed);

    switch (intentResult.type) {
      case "navigate":
        setHistory((prev) => [...prev, command]);
        setHistoryIndex(-1);
        router.push(intentResult.route);
        break;
      case "clear":
        setHistory((prev) => [...prev, command]);
        setHistoryIndex(-1);
        router.push("/clear");
        break;
      case "stub":
        setHistory((prev) => [...prev, command]);
        setMessage(intentResult.message);
        break;
      default:
        setHistory((prev) => [...prev, command]);
        setMessage("Unknown command — try /help");
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
