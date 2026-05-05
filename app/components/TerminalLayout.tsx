"use client";

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export function TerminalLayout({ children }: TerminalLayoutProps) {
  return (
    <div className="terminal-layout font-mono min-h-screen bg-black text-green-400 p-4 flex flex-col">
      <div className="border-t-2 border-lime-500">
        ┌ Terminal ── zachbloss.com ──┐
      </div>
      <div role="log" className="overflow-y-auto flex-grow p-2 min-h-[calc(100vh-80px)]">
        {children}
      </div>
      <div className="border-b-2 border-lime-500 p-2">
        <div className="flex items-center">
          <span className="text-purple-400 mr-2">❯</span>
          <input
            id="terminal-input"
            type="text"
            role="textbox"
            aria-label="Terminal command input"
            className="bg-transparent outline-none text-green-400 flex-grow font-mono"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
