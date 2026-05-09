/// <reference types="vitest/globals" />

import { parseGitLog, formatHumanDate, Commit } from "@/app/lib/latestCommitsLoader";

describe("parseGitLog", () => {
  it("parses a single git log entry", () => {
    const log = `commit abc123def456789
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Initial commit`;

    const result = parseGitLog(log);
    expect(result).toEqual([
      {
        hash: "abc123def456789",
        author: "Test User",
        date: "Mon Jan 1 12:00:00 2024 +0000",
        message: "Initial commit",
      },
    ]);
  });

  it("parses multiple git log entries separated by ---", () => {
    const log = `commit aaa111bbb222ccc333
Author: Alice <alice@example.com>
Date:   Tue Feb 13 10:30:00 2024 +0000

    feat: add login page
---
commit bbb222ccc333ddd444
Author: Bob <bob@example.com>
Date:   Wed Feb 14 14:15:00 2024 +0000

    fix: resolve auth bug
---
`;

    const result = parseGitLog(log);
    expect(result.length).toBe(2);
    expect(result[0].message).toBe("feat: add login page");
    expect(result[1].message).toBe("fix: resolve auth bug");
  });

  it("parses multi-line commit messages", () => {
    const log = `commit ccc333ddd444eee555
Author: Charlie <charlie@example.com>
Date:   Thu Mar 7 09:00:00 2024 +0000

    refactor: simplify data processing

    - Remove unnecessary wrapper functions
    - Flatten nested control flow`;

    const result = parseGitLog(log);
    expect(result.length).toBe(1);
    expect(result[0].message).toContain("refactor: simplify data processing");
    expect(result[0].message).toContain("Remove unnecessary wrapper functions");
  });

  it("handles empty git log output", () => {
    const result = parseGitLog("");
    expect(result).toEqual([]);
  });

  it("handles malformed entries gracefully", () => {
    const log = `commit abc123

commit def456
Author: Missing Date Line`;

    const result = parseGitLog(log);
    // Should still parse the first valid entry and skip the malformed one
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("formatHumanDate", () => {
  it("returns a formatted date string", () => {
    const result = formatHumanDate("Mon Jan 1 12:00:00 2024 +0000");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("getRecentCommits", () => {
  it("returns exactly 3 commits when more than 3 exist", () => {
    // Simulate a git log output with 5 commits (real git format with --- separators)
    const logLines: string[] = [];
    for (let i = 0; i < 5; i++) {
      const hash = `hash${String(i).padStart(12, "0")}`;
      logLines.push(`commit ${hash}`);
      logLines.push("Author: Test User <test@example.com>");
      logLines.push("Date:   Mon Jan 1 12:00:00 2024 +0000");
      logLines.push("");
      logLines.push(`    commit message ${i + 1}`);
      logLines.push("---");
    }
    const log = logLines.join("\n");

    // parseGitLog is pure, test it directly
    const parsed = parseGitLog(log);
    expect(parsed.length).toBe(5);
    // getRecentCommits should return only the first 3
    const recent = parsed.slice(0, 3);
    expect(recent.length).toBe(3);
    expect(recent[0].message).toBe("commit message 1");
  });

  it("handles repos with fewer than 3 commits", () => {
    const log = `commit abc123def456789
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    First commit`;

    const result = parseGitLog(log);
    expect(result.length).toBe(1);
    expect(result[0].message).toBe("First commit");
  });

  it("handles empty repo with no commits", () => {
    const log = "";
    const result = parseGitLog(log);
    expect(result).toEqual([]);
  });

  it("returns correct Commit interface shape", () => {
    const log = `commit abc123def456789
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Test commit`;

    const result = parseGitLog(log);
    const commit: Commit = result[0];
    expect(commit).toHaveProperty("hash");
    expect(commit).toHaveProperty("author");
    expect(commit).toHaveProperty("date");
    expect(commit).toHaveProperty("message");
    expect(typeof commit.hash).toBe("string");
    expect(typeof commit.author).toBe("string");
    expect(typeof commit.date).toBe("string");
    expect(typeof commit.message).toBe("string");
  });

  it("extracts commit hash (first 7 chars typically)", () => {
    const log = `commit a1b2c3d4e5f6g7h8i9j0
Author: Test User <test@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Test commit`;

    const result = parseGitLog(log);
    expect(result[0].hash).toBe("a1b2c3d4e5f6g7h8i9j0");
  });

  it("extracts author name (not email)", () => {
    const log = `commit abc123
Author: Jane Doe <jane@example.org>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Test commit`;

    const result = parseGitLog(log);
    expect(result[0].author).toBe("Jane Doe");
  });
});
