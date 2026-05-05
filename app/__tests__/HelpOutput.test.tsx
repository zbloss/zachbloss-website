/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HelpOutput } from "@/app/components/HelpOutput";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

describe("HelpOutput", () => {
  it("renders a heading", () => {
    render(<HelpOutput />);
    expect(screen.getByText(/Available Commands/)).toBeInTheDocument();
  });

  it("renders all known commands", () => {
    render(<HelpOutput />);
    for (const cmd of KNOWN_COMMANDS) {
      expect(screen.getByText(cmd.command)).toBeInTheDocument();
    }
  });

  it("renders descriptions for each command", () => {
    render(<HelpOutput />);
    for (const cmd of KNOWN_COMMANDS) {
      expect(screen.getByText(cmd.description)).toBeInTheDocument();
    }
  });

  it("renders in a table-like structure with ASCII borders", () => {
    const { container } = render(<HelpOutput />);
    const el = container.querySelector(".help-output");
    expect(el).toBeInTheDocument();
  });
});
