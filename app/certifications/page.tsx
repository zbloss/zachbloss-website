import { TerminalLayout } from "@/app/components/TerminalLayout";
import { CertCard } from "@/app/components/CertCard";
import certificationsData from "@/public/data/certifications.json";

export default function CertificationsPage() {
  return (
    <TerminalLayout>
      <div className="certifications-output space-y-2" role="region" aria-label="Certifications">
        <div className="text-purple-400 font-bold text-lg">
          ┌ Certifications ─────────────────────────┐
        </div>
        <div className="pl-2">
          {certificationsData.map((cert, index) => (
            <CertCard key={index} certification={cert} />
          ))}
        </div>
        <div className="text-gray-500 pl-2">
          └──────────────────────────────────────────┘
        </div>
      </div>
    </TerminalLayout>
  );
}
