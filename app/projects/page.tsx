import { TerminalLayout } from "@/app/components/TerminalLayout";
import { ProjectCard } from "@/app/components/ProjectCard";
import projectsData from "@/public/data/projects.json";

export default function ProjectsPage() {
  return (
    <TerminalLayout>
      <div className="projects-output space-y-2" role="region" aria-label="Projects">
        <div className="text-purple-400 font-bold text-lg">
          ┌ Projects ────────────────────────────────┐
        </div>
        <div className="pl-2">
          {projectsData.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
        <div className="text-gray-500 pl-2">
          └───────────────────────────────────────────┘
        </div>
      </div>
    </TerminalLayout>
  );
}
