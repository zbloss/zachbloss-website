import { TerminalLayout } from "@/app/components/TerminalLayout";

export default function ClearPage() {
  // /clear renders an empty terminal body — the output was cleared.
  return (
    <TerminalLayout>
      <div className="text-gray-500" aria-live="polite">
        Terminal cleared.
      </div>
    </TerminalLayout>
  );
}
