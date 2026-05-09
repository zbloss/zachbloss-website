/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MobileCommandShortcuts } from "@/app/components/MobileCommandShortcuts";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

describe("MobileCommandShortcuts", () => {
  it("renders a row of command buttons", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    expect(screen.getByText("/help")).toBeInTheDocument();
  });

  it("renders one button per known command", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    for (const cmd of KNOWN_COMMANDS) {
      expect(screen.getByText(cmd.command)).toBeInTheDocument();
    }
  });

  it("renders the expected number of buttons", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(KNOWN_COMMANDS.length);
  });

  it("calls onCommand with the correct command when a button is clicked", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    const helpButton = screen.getByText("/help");
    fireEvent.click(helpButton);
    expect(onCommand).toHaveBeenCalledWith("/help");
  });

  it("calls onCommand with the correct command for /projects", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    const projectsButton = screen.getByText("/projects");
    fireEvent.click(projectsButton);
    expect(onCommand).toHaveBeenCalledWith("/projects");
  });

  it("calls onCommand with the correct command for /clear", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    const clearButton = screen.getByText("/clear");
    fireEvent.click(clearButton);
    expect(onCommand).toHaveBeenCalledWith("/clear");
  });

  it("renders all buttons including /home", () => {
    const onCommand = vi.fn();
    render(<MobileCommandShortcuts onCommand={onCommand} />);
    expect(screen.getByText("/home")).toBeInTheDocument();
  });
});
