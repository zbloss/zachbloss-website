/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AboutOutput } from "@/app/components/AboutOutput";

describe("AboutOutput", () => {
  it("renders a heading", () => {
    render(<AboutOutput />);
    expect(screen.getByText(/About/)).toBeInTheDocument();
  });

  it("renders all three skills sections", () => {
    render(<AboutOutput />);
    expect(screen.getByText(/Generative AI/)).toBeInTheDocument();
    expect(screen.getByText(/Data Science/)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Analytics/)).toBeInTheDocument();
  });

  it("renders skill items for each section", () => {
    render(<AboutOutput />);
    // Check that skill items are present
    expect(screen.getByText(/LLM fine-tuning/)).toBeInTheDocument();
    expect(screen.getByText(/Statistical modeling/)).toBeInTheDocument();
    expect(screen.getByText(/MLOps/)).toBeInTheDocument();
  });

  it("renders in a styled container with ASCII borders", () => {
    const { container } = render(<AboutOutput />);
    const el = container.querySelector(".about-output");
    expect(el).toBeInTheDocument();
  });
});
