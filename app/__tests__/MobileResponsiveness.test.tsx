/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HelpOutput } from "@/app/components/HelpOutput";
import { CertCard } from "@/app/components/CertCard";
import { ProjectCard } from "@/app/components/ProjectCard";
import { BlogPostList } from "@/app/components/BlogPostList";
import { LatestCommitsOutput } from "@/app/components/LatestCommitsOutput";
import { ContactForm } from "@/app/components/ContactForm";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

const mockCert = {
  title: "AWS Certified Solutions Architect",
  description: "A test certification description with some text.",
  imageUrl: "/images/cert.png",
  link: "https://example.com/cert",
};

const mockProject = {
  title: "Test Project",
  description: "A test project description with some text.",
  imageUrl: "/images/project.png",
  link: "https://example.com/project",
};

const mockPosts = [
  {
    title: "Test Post",
    date: "2024-01-01",
    slug: "test-post",
    excerpt: "A test excerpt with some text.",
  },
];

const mockCommits = [
  {
    hash: "abc123def456",
    author: "Test Author",
    date: "2024-01-01",
    message: "feat: add mobile responsiveness fix",
  },
];

describe("Mobile Responsiveness — no horizontal overflow", () => {
  it("HelpOutput does not use fixed min-width that causes overflow", () => {
    const { container } = render(<HelpOutput />);
    // Check that no command span has a fixed min-width that would overflow on mobile
    const fontBoldSpans = container.querySelectorAll(".help-output span.font-bold");
    fontBoldSpans.forEach((span) => {
      expect(span.className).not.toContain("min-w-[100px]");
    });
  });

  it("HelpOutput uses responsive text wrapping", () => {
    render(<HelpOutput />);
    const descriptionEl = screen.getByText(KNOWN_COMMANDS[0].description);
    // Should have break-words or text-wrap class for mobile safety
    const classes = descriptionEl.className;
    expect(
      classes.includes("break-words") ||
      classes.includes("text-wrap") ||
      classes.includes("break-all")
    ).toBeTruthy();
  });

  it("TerminalLayout header does not use fixed-width ASCII borders", () => {
    const { container } = render(
      <TerminalLayout><div>test</div></TerminalLayout>
    );
    const header = container.querySelector(".terminal-layout > div.border-t-2");
    expect(header).toBeInTheDocument();
    // Check that the header doesn't use whitespace-nowrap (which would prevent wrapping)
    expect(header?.className).not.toContain("whitespace-nowrap");
  });

  it("CertCard wraps description text properly", () => {
    const { container } = render(<CertCard certification={mockCert} />);
    const descEl = container.querySelector(".cert-card p.text-gray-300");
    expect(descEl).toBeInTheDocument();
    // Should have text-wrap or break-words for mobile
    const classes = descEl?.className || "";
    expect(
      classes.includes("break-words") ||
      classes.includes("text-wrap")
    ).toBeTruthy();
  });

  it("ProjectCard wraps description text properly", () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    const descEl = container.querySelector(".project-card p.text-gray-300");
    expect(descEl).toBeInTheDocument();
    const classes = descEl?.className || "";
    expect(
      classes.includes("break-words") ||
      classes.includes("text-wrap")
    ).toBeTruthy();
  });

  it("BlogPostList wraps excerpt text properly", () => {
    const { container } = render(<BlogPostList posts={mockPosts} />);
    const excerptEl = container.querySelector(".blog-output p.text-gray-300.text-sm");
    expect(excerptEl).toBeInTheDocument();
    const classes = excerptEl?.className || "";
    expect(
      classes.includes("break-words") ||
      classes.includes("text-wrap")
    ).toBeTruthy();
  });

  it("LatestCommitsOutput wraps commit message text properly", () => {
    const { container } = render(<LatestCommitsOutput commits={mockCommits} />);
    const msgEl = container.querySelector(".latest-commits-output .text-gray-300.pl-2 span:last-child");
    expect(msgEl).toBeInTheDocument();
    const classes = msgEl?.className || "";
    expect(
      classes.includes("break-words") ||
      classes.includes("text-wrap")
    ).toBeTruthy();
  });

  it("BlogPostView wraps title in header properly", () => {
    // Test that the blog post header doesn't cause horizontal overflow
    render(
      <BlogPostList posts={mockPosts} />
    );
    // The box header should not overflow - it should use truncate or break-words
    const boxHeader = screen.getByRole("region", { name: /Blog Posts/i });
    const headerEl = boxHeader.querySelector(".text-purple-400.font-bold.text-lg");
    expect(headerEl).toBeInTheDocument();
    // Should not use whitespace-nowrap
    expect(headerEl?.className).not.toContain("whitespace-nowrap");
  });

  it("ContactForm does not use fixed-width box borders", () => {
    const { container } = render(<ContactForm />);
    // The contact output box header should not be whitespace-nowrap
    const headerEl = container.querySelector(".contact-output .text-purple-400.font-bold.text-lg");
    expect(headerEl).toBeInTheDocument();
    expect(headerEl?.className).not.toContain("whitespace-nowrap");
  });
});


