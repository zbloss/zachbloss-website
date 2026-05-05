"use client";

import { TerminalLayout } from "@/app/components/TerminalLayout";
import { BootSequence } from "@/app/components/BootSequence";

export default function LandingPage() {
  return (
    <TerminalLayout>
      <BootSequence />
    </TerminalLayout>
  );
}
