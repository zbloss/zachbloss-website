"use client";

import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { Navigation } from "./components/Navigation";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-medium">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/black-ink-background.png")' }}
      ></div>
      <div className="relative z-1 min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl mb-4 font-bold">Oops!</h1>
            <p className="text-xl md:text-2xl mb-8">
              It seems like this page has taken a vacation! 🌴
            </p>
            <p className="text-lg mb-4">
              But don&apos;t worry, you can still find your way back to safety!
            </p>
            <Link href="/">
              <Button className="bg-purple-500 hover:bg-purple-400 text-white transition-colors border-2 border-purple-600 text-lg px-8 py-3">
                Go Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
