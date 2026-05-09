import Link from "next/link";

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-card border-2 border-purple-600 bg-purple-950/30 p-3 mb-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-24 h-24 object-contain border border-purple-700 bg-black"
          />
        </div>
        <div className="flex-grow space-y-1 min-w-0">
          <Link
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2"
          >
            ─ {project.title}
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
