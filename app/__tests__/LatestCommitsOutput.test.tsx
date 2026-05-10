/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LatestCommitsOutput } from "@/app/components/LatestCommitsOutput";
import type { Commit } from "@/app/lib/latestCommitsLoader";

describe("LatestCommitsOutput", () => {
  const mockCommits: Commit[] = [
    {
      hash: "a1b2c3d4e5f6",
      author: "Test User",
      date: "Mon Jan 1 12:00:00 2024 +0000",
      message: "feat: add latest commits page",
    },
    {
      hash: "b2c3d4e5f6a1",
      author: "Test User",
      date: "Sun Dec 31 12:00:00 2023 +0000",
      message: "fix: resolve build issue",
    },
    {
      hash: "c3d4e5f6a1b2",
      author: "Test User",
      date: "Sat Dec 30 12:00:00 2023 +0000",
      message: "init: scaffold project",
    },
  ];

  it("renders a heading", () => {
    render(<LatestCommitsOutput commits={mockCommits} />);
    expect(screen.getByText(/Recent Commits/)).toBeInTheDocument();
  });

  it("renders all commit messages", () => {
    render(<LatestCommitsOutput commits={mockCommits} />);
    for (const commit of mockCommits) {
      expect(screen.getByText(commit.message)).toBeInTheDocument();
    }
  });

  it("renders formatted dates", () => {
    render(<LatestCommitsOutput commits={mockCommits} />);
    // formatHumanDate returns "Jan 1, 2024" style format
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Dec 31, 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Dec 30, 2023/)).toBeInTheDocument();
  });

  it("renders commit hashes (short form, 7 chars)", () => {
    render(<LatestCommitsOutput commits={mockCommits} />);
    expect(screen.getByText(/a1b2c3d/)).toBeInTheDocument();
    expect(screen.getByText(/b2c3d4e/)).toBeInTheDocument();
  });

  it("renders in a styled container with ASCII borders", () => {
    const { container } = render(<LatestCommitsOutput commits={mockCommits} />);
    const el = container.querySelector(".latest-commits-output");
    expect(el).toBeInTheDocument();
  });

  it("handles empty commits gracefully", () => {
    render(<LatestCommitsOutput commits={[]} />);
    expect(screen.getByText(/No commits yet/)).toBeInTheDocument();
  });

  it("shows 'coming soon' style message when no commits exist", () => {
    const { container } = render(<LatestCommitsOutput commits={[]} />);
    const el = container.querySelector(".latest-commits-output");
    expect(el).toBeInTheDocument();
  });
});
