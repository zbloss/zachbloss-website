"use client";

import { TerminalLayout } from "@/app/components/TerminalLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <TerminalLayout>
      <div className="space-y-4">
        <div className="text-red-400 font-bold text-lg">
          ERROR: Page not found — this route does not exist.
        </div>
        <div className="text-gray-400">
          It seems like this page has taken a vacation! 🌴
        </div>
        <div className="text-gray-400">
          But don&apos;t worry, you can still find your way back to safety!
        </div>
        <Link href="/">
          <Button className="bg-purple-500 hover:bg-purple-400 text-white transition-colors border-2 border-purple-600 text-lg px-8 py-3">
            Go Home
          </Button>
        </Link>
      </div>
    </TerminalLayout>
  );
}
