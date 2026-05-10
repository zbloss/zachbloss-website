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
  it("HelpOutput renders all command descriptions without clipping", () => {
    render(<HelpOutput />);
    for (const cmd of KNOWN_COMMANDS) {
      expect(screen.getByText(cmd.command)).toBeInTheDocument();
      expect(screen.getByText(cmd.description)).toBeInTheDocument();
    }
  });

  it("HelpOutput renders box header and footer", () => {
    render(<HelpOutput />);
    expect(screen.getByText(/Available Commands/)).toBeInTheDocument();
  });

  it("HelpOutput layout is responsive — commands and descriptions are independently queryable", () => {
    render(<HelpOutput />);
    const firstCommand = screen.getByText(KNOWN_COMMANDS[0].command);
    const firstDescription = screen.getByText(KNOWN_COMMANDS[0].description);
    expect(firstCommand).toBeInTheDocument();
    expect(firstDescription).toBeInTheDocument();
  });

  it("TerminalLayout renders terminal branding", () => {
    render(<TerminalLayout><div>test</div></TerminalLayout>);
    expect(screen.getByText(/zachbloss\.com/)).toBeInTheDocument();
  });

  it("CertCard renders certification details within container", () => {
    render(<CertCard certification={mockCert} />);
    expect(screen.getByText(/AWS Certified Solutions Architect/)).toBeInTheDocument();
    expect(screen.getByText(mockCert.description)).toBeInTheDocument();
  });

  it("ProjectCard renders project details within container", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    expect(screen.getByText(mockProject.description)).toBeInTheDocument();
  });

  it("BlogPostList renders post excerpts within container", () => {
    render(<BlogPostList posts={mockPosts} />);
    expect(screen.getByText(/Blog Posts/)).toBeInTheDocument();
    expect(screen.getByText(/Test Post/)).toBeInTheDocument();
    expect(screen.getByText(mockPosts[0].excerpt)).toBeInTheDocument();
  });

  it("LatestCommitsOutput renders commit messages within container", () => {
    render(<LatestCommitsOutput commits={mockCommits} />);
    expect(screen.getByText(/Recent Commits/)).toBeInTheDocument();
    expect(screen.getByText(mockCommits[0].message)).toBeInTheDocument();
  });

  it("ContactForm renders form content within container", () => {
    render(<ContactForm />);
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });
});


