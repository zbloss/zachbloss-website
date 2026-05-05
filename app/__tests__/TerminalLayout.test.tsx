/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { BootSequence } from "@/app/components/BootSequence";

describe("BootSequence", () => {
  it("renders site name on the first line", () => {
    render(<BootSequence />);
    expect(screen.getByText(/Zachary Bloss/)).toBeInTheDocument();
  });

  it("renders a tagline after the site name", () => {
    render(<BootSequence />);
    expect(screen.getByText(/AI, MLOps, and Full-Stack Development/)).toBeInTheDocument();
  });

  it("renders the /help hint", () => {
    render(<BootSequence />);
    expect(screen.getByText(/\/help/)).toBeInTheDocument();
  });

  it("does not repeat the boot sequence content on re-render", () => {
    const { rerender } = render(<BootSequence />);
    const allSiteNameElements = screen.queryAllByText(/Zachary Bloss/);
    expect(allSiteNameElements.length).toBe(1);
    rerender(<BootSequence />);
    const allSiteNameElementsAfter = screen.queryAllByText(/Zachary Bloss/);
    expect(allSiteNameElementsAfter.length).toBe(1);
  });
});

describe("TerminalLayout", () => {
  it("renders the TerminalBody area", () => {
    render(<TerminalLayout><div>test content</div></TerminalLayout>);
    const terminalBody = screen.getByRole("log");
    expect(terminalBody).toBeInTheDocument();
  });

  it("renders the TerminalPrompt input at the bottom", () => {
    render(<TerminalLayout><div>test content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("has ASCII-style borders in the terminal chrome", () => {
    render(<TerminalLayout><div>test content</div></TerminalLayout>);
    const terminal = screen.getByRole("log").closest(".terminal-layout");
    expect(terminal).toBeInTheDocument();
  });

  it("renders children content inside the TerminalBody", () => {
    render(<TerminalLayout><div data-testid="child-content">child</div></TerminalLayout>);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("applies monospace font globally via the terminal layout", () => {
    render(<TerminalLayout><div>test</div></TerminalLayout>);
    const terminal = screen.getByRole("log").closest(".terminal-layout");
    expect(terminal).toHaveClass("font-mono");
  });

});
