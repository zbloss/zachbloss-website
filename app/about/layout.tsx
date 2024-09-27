import { Metadata } from "next";
import { GenerateMetadata } from "@/app/components/GenerateMetadata";

export const metadata: Metadata = GenerateMetadata({
  title: "Automated Expert Recruiting",
  description:
    "Your AI-powered recruiter streamlines candidate recruitment and conducts interviews 24/7.",
  keywords: [
    "recruiting tools",
    "automated recruiting",
    "ai powered recruiter",
    "ai interviewer",
    "interview more candidates",
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
