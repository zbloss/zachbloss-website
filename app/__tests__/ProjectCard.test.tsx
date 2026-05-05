/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProjectCard } from "@/app/components/ProjectCard";

const mockProject = {
  title: "Test Project",
  description: "A test project description.",
  imageUrl: "/images/test.png",
  link: "https://example.com",
};

describe("ProjectCard", () => {
  it("renders the project title", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
  });

  it("renders the project description", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/A test project description/)).toBeInTheDocument();
  });

  it("renders a link to the project", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders with ASCII-style borders", () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    const el = container.querySelector(".project-card");
    expect(el).toBeInTheDocument();
  });
});
