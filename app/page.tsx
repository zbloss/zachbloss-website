"use client";

import { TerminalLayout } from "@/app/components/TerminalLayout";
import { BootSequence } from "@/app/components/BootSequence";
import { HelpOutput } from "@/app/components/HelpOutput";

export default function LandingPage() {
  return (
    <TerminalLayout>
      <BootSequence />
      <HelpOutput />
    </TerminalLayout>
  );
}
