import { TerminalLayout } from "@/app/components/TerminalLayout";
import { LatestCommitsOutput } from "@/app/components/LatestCommitsOutput";
import { getRecentCommits } from "@/app/lib/latestCommitsLoader";

export default function LatestPage() {
  const commits = getRecentCommits();

  return (
    <TerminalLayout>
      <LatestCommitsOutput commits={commits} />
    </TerminalLayout>
  );
}
