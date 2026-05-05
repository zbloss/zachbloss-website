"use client";

import aboutData from "@/public/data/about.json";

export function AboutOutput() {
  return (
    <div className="about-output space-y-4" role="region" aria-label="About Zachary Bloss">
      <div className="text-purple-400 font-bold text-lg">
        ┌ About ─────────────────────────────────────┐
      </div>
      <div className="pl-2 space-y-3">
        {aboutData.map((section) => (
          <div key={section.section}>
            <div className="text-lime-400 font-bold">{section.section}</div>
            <div className="flex flex-wrap gap-1 pl-2 mt-1">
              {section.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-900 text-purple-300 px-2 py-0.5 text-sm border border-purple-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-gray-500 pl-2">
        └─────────────────────────────────────────────┘
      </div>
    </div>
  );
}
