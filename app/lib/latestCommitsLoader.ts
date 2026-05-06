/**
 * LatestCommitsLoader — runs `git log` at Next.js build time
 * and formats the 3 most recent commits as static data.
 *
 * No runtime git access — output is baked in at build.
 */

import { execSync } from "child_process";

export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

/**
 * Parse git log output (porcelain format) into an array of Commit objects.
 * Uses `git log --pretty=format` with a separator for reliable parsing.
 *
 * Format expected:
 *   commit <hash>\n
 *   Author: <name> <email>\n
 *   Date:   <raw-date>\n
 *   \n
 *   <message>
 *   ---
 */
export function parseGitLog(raw: string): Commit[] {
  const entries = raw.split("---\n").filter(Boolean);
  const commits: Commit[] = [];

  for (const entry of entries) {
    const lines = entry.trimStart().split("\n");

    // Extract hash from "commit <hash>" line
    const hashMatch = lines[0]?.match(/^commit\s+(\S+)/);
    if (!hashMatch) continue;

    const hash = hashMatch[1];

    // Extract author name (before the email in angle brackets)
    const authorMatch = lines[1]?.match(/^Author:\s+(.+?)\s+</);
    const author = authorMatch ? authorMatch[1].trim() : "Unknown";

    // Extract date
    const dateMatch = lines[2]?.match(/^Date:\s+(.+)$/);
    const date = dateMatch ? dateMatch[1].trim() : "";

    // Rest is the message (all lines after Date, with leading spaces trimmed)
    const messageLines = lines.slice(3).filter((l) => l.trim() !== "");
    const message = messageLines.map((l) => l.trim()).join(" ");

    commits.push({ hash, author, date, message });
  }

  return commits;
}

/**
 * Format a raw git date string into a human-readable format.
 * Input: "Mon Jan 1 12:00:00 2024 +0000"
 * Output: "Jan 1, 2024" (month, day, year)
 */
export function formatHumanDate(raw: string): string {
  try {
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

/**
 * Run `git log` at build time and return the 3 most recent commits
 * with human-readable dates.
 *
 * Called in page.tsx at build time; the output is static.
 * Handles repos with fewer than 3 commits gracefully.
 */
export function getRecentCommits(): Commit[] {
  try {
    // Porcelain format: one-line hash, author, date per entry, "---" separator
    const output = execSync(
      'git log -3 --pretty=format:"commit %H\\nAuthor: %an <%ae>\\nDate:   %ad\\n\\n    %s\\n---\\n" --date=short 2>/dev/null',
      { encoding: "utf-8" },
    );

    const commits = parseGitLog(output);
    return commits;
  } catch {
    // Fallback: return empty array if git is unavailable
    return [];
  }
}
