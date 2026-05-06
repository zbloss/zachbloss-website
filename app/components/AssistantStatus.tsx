/**
 * AssistantStatus — shows the IntentResolver model loading state.
 *
 * Displays "loading assistant…" while the model loads in the background,
 * transitions to "assistant ready" once the model is available.
 */

import { useState, useEffect, useRef } from "react";
import { getIntentResolver } from "@/app/lib/intentResolver";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

export function AssistantStatus(): JSX.Element {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const resolverRef = useRef<ReturnType<typeof getIntentResolver> | null>(null);

  useEffect(() => {
    // Create the resolver singleton — it handles the 3-second delay internally
    resolverRef.current = getIntentResolver(KNOWN_COMMANDS);

    // Poll the resolver's ready state
    const checkReady = setInterval(() => {
      if (resolverRef.current?.isReady()) {
        setStatus("ready");
        clearInterval(checkReady);
      }
    }, 200);

    // Safety net: if model takes too long, timeout to "ready" anyway
    const timeout = setTimeout(() => {
      setStatus("ready");
      clearInterval(checkReady);
    }, 15000);

    return () => {
      clearInterval(checkReady);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <span className="text-xs text-gray-500" aria-live="polite">
      {status === "loading"
        ? "loading assistant…"
        : "assistant ready"}
    </span>
  );
}
