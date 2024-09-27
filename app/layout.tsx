import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GenerateMetadata } from "@/app/components/GenerateMetadata";

import "./globals.css";
import "./general_sans.css";

export const metadata: Metadata = GenerateMetadata({
  title: "Zach Bloss Portfolio",
  description:
    "Explore the portfolio of Zach Bloss, showcasing projects, skills, certificates, awards and professional experience in Data Science and Artifical Intelligence.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
    </html>
  );
}
