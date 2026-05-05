"use client";

export function BootSequence() {
  return (
    <div className="space-y-1" aria-live="polite">
      <div className="boot-line text-purple-400 font-bold boot-reveal">
        Zachary Bloss
      </div>
      <div className="boot-line text-green-400 boot-reveal" style={{ animationDelay: "0.3s" }}>
        AI, MLOps, and Full-Stack Development
      </div>
      <div className="boot-line boot-reveal" style={{ animationDelay: "0.6s" }}>
      </div>
      <div className="boot-line text-gray-400 boot-reveal" style={{ animationDelay: "0.9s" }}>
        hint: run /help to see all available commands
      </div>
    </div>
  );
}
