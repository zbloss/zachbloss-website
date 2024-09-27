"use client";

import Image from "next/image";
import { Navigation } from "@/app/components/Navigation";
import About from "@/app/components/About";
import Certifications from "./components/Certifications";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-medium">
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          playsInline
          className="object-cover w-full h-full"
        >
          <source src="/video/black-ink-flow-1080p.mp4" type="video/mp4" />
          <Image
            src="/images/black-ink-background.png"
            alt="Black Ink Flow"
            width={1920}
            height={1080}
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-1 min-h-screen flex flex-col">
        <Navigation />

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl mb-4 font-bold">
              Zachary <span className="font-medium text-purple-400">Bloss</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              AI, MLOps, and Full-Stack Development
            </p>
          </div>
        </main>
      </div>
      <div className="relative z-1 min-h-screen flex flex-col">
        <About />
        <Certifications />
      </div>
    </div>
  );
}
