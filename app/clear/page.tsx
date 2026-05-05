import { TerminalLayout } from "@/app/components/TerminalLayout";

export default function ClearPage() {
  return (
    <TerminalLayout>
      <div className="text-gray-500" aria-live="polite">
        Terminal cleared.
      </div>
    </TerminalLayout>
  );
}
