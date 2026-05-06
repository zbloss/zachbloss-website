"use client";

import { useState, useRef, useEffect, KeyboardEvent, RefObject } from "react";

interface TerminalPromptProps {
  /** Called with the trimmed command string when Enter is pressed. */
  onCommand: (command: string) => void;
  /** History of previously entered commands for this session. */
  history: string[];
  /** Current index in the history (−1 = at prompt, not browsing). */
  historyIndex: number;
  /** Optional ref to forward to the input element. */
  inputRef?: RefObject<HTMLInputElement>;
}

export function TerminalPrompt({
  onCommand,
  history,
  historyIndex,
  inputRef,
}: TerminalPromptProps) {
  // When historyIndex changes externally (parent updates), reset browsing.
  useEffect(() => {
    if (historyIndex >= 0) {
      setBrowseOffset(0);
      setTypedValue("");
    }
  }, [historyIndex]);

  // Browse offset: 0 = at prompt, 1 = one step up, etc.
  const [browseOffset, setBrowseOffset] = useState(0);
  // Value the user has typed (overrides history browsing).
  const [typedValue, setTypedValue] = useState("");
  const localInputRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || localInputRef;

  // The current text to display in the input.
  let displayValue = "";
  if (typedValue) {
    displayValue = typedValue;
  } else if (browseOffset > 0 && browseOffset <= history.length) {
    displayValue = history[history.length - browseOffset];
  }

  function handleSubmit() {
    const trimmed = displayValue.trim();
    if (trimmed) {
      onCommand(trimmed);
      setBrowseOffset(0);
      setTypedValue("");
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setTypedValue(""); // exit typed mode when browsing
      setBrowseOffset((prev) => Math.min(prev + 1, history.length));
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setTypedValue("");
      setBrowseOffset((prev) => Math.max(prev - 1, 0));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-purple-400 font-mono select-none">❯</span>
      <input
        ref={ref}
        id="terminal-input"
        type="text"
        role="textbox"
        aria-label="Terminal command input"
        value={displayValue}
        onChange={(e) => {
          setTypedValue(e.target.value);
          setBrowseOffset(0); // exit browsing when typing
        }}
        onKeyDown={handleKeyDown}
        className="bg-transparent outline-none text-green-400 flex-grow font-mono placeholder-gray-600"
        placeholder="Type a command…"
      />
    </div>
  );
}
