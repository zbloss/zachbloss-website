import type { Commit } from "@/app/lib/latestCommitsLoader";
import { formatHumanDate } from "@/app/lib/latestCommitsLoader";

interface LatestCommitsOutputProps {
  commits: Commit[];
}

export function LatestCommitsOutput({ commits }: LatestCommitsOutputProps) {
  if (commits.length === 0) {
    return (
      <div className="latest-commits-output space-y-4 overflow-hidden" role="region" aria-label="Recent commits">
        <div className="text-purple-400 font-bold text-lg truncate">
          ┌ Recent Commits ─────────────────────┐
        </div>
        <div className="pl-2 text-gray-500">No commits yet.</div>
        <div className="text-gray-500 pl-2 truncate">
          └─────────────────────────────────────┘
        </div>
      </div>
    );
  }

  return (
    <div className="latest-commits-output space-y-4 overflow-hidden" role="region" aria-label="Recent commits">
      <div className="text-purple-400 font-bold text-lg truncate">
        ┌ Recent Commits ─────────────────────┐
      </div>
      <div className="pl-2 space-y-3">
        {commits.map((commit, index) => (
          <div key={commit.hash} className="space-y-1">
            <div className="text-lime-400 font-bold">
              {formatHumanDate(commit.date)}
            </div>
            <div className="text-gray-300 pl-2">
              <span className="text-gray-600 font-mono text-xs">{commit.hash.slice(0, 7)}</span>
              {" — "}
              <span className="break-words">{commit.message}</span>
            </div>
            {index < commits.length - 1 && (
              <div className="text-gray-700 pl-2 border-l-2 border-purple-900 ml-1 h-3" />
            )}
          </div>
        ))}
      </div>
      <div className="text-gray-500 pl-2 truncate">
        └─────────────────────────────────────┘
      </div>
    </div>
  );
}
