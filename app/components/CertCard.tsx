import Link from "next/link";

interface Certification {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

interface CertCardProps {
  certification: Certification;
}

export function CertCard({ certification }: CertCardProps) {
  return (
    <div className="cert-card border-2 border-lime-600 bg-lime-950/20 p-3 mb-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certification.imageUrl}
            alt={certification.title}
            className="w-24 h-24 object-contain border border-lime-700 bg-black"
          />
        </div>
        <div className="flex-grow space-y-1 min-w-0">
          <Link
            href={certification.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2"
          >
            ─ {certification.title}
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            {certification.description}
          </p>
        </div>
      </div>
    </div>
  );
}
