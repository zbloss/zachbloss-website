"use client";

export function BootSequence() {
  return (
    <div className="space-y-1" aria-live="polite">
      <div className="boot-line text-purple-400 font-bold boot-reveal boot-delay-0">
        Zachary Bloss
      </div>
      <div className="boot-line text-green-400 boot-reveal boot-delay-1">
        AI, MLOps, and Full-Stack Development
      </div>
      <div className="boot-line boot-reveal boot-delay-2" aria-hidden="true">
      </div>
      <div className="boot-line text-gray-400 boot-reveal boot-delay-3">
        hint: run /help to see all available commands
      </div>
    </div>
  );
}
