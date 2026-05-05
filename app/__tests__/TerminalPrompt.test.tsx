/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalPrompt } from "@/app/components/TerminalPrompt";

describe("TerminalPrompt", () => {
  it("renders the prompt character ❯", () => {
    render(<TerminalPrompt onCommand={() => {}} history={[]} historyIndex={0} />);
    expect(screen.getByText("❯")).toBeInTheDocument();
  });

  it("renders a text input field", () => {
    render(<TerminalPrompt onCommand={() => {}} history={[]} historyIndex={0} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("calls onCommand with the input value when Enter is pressed", () => {
    const onCommand = vi.fn();
    render(<TerminalPrompt onCommand={onCommand} history={[]} historyIndex={0} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommand).toHaveBeenCalledWith("/help");
  });

  it("calls onCommand with trimmed input value", () => {
    const onCommand = vi.fn();
    render(<TerminalPrompt onCommand={onCommand} history={[]} historyIndex={0} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "  /clear  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommand).toHaveBeenCalledWith("/clear");
  });

  it("does not call onCommand for empty input", () => {
    const onCommand = vi.fn();
    render(<TerminalPrompt onCommand={onCommand} history={[]} historyIndex={0} />);
    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommand).not.toHaveBeenCalled();
  });

  it("updates input when navigating history with ↑ key", () => {
    const onCommand = vi.fn();
    const history = ["/help", "/clear"];
    render(
      <TerminalPrompt
        onCommand={onCommand}
        history={history}
        historyIndex={-1}
      />
    );
    const input = screen.getByRole("textbox");

    // Press ArrowUp — should show last history item
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(input).toHaveValue("/clear");
  });

  it("updates input when navigating history with ↓ key (from top)", () => {
    const onCommand = vi.fn();
    const history = ["/help", "/clear"];
    render(
      <TerminalPrompt
        onCommand={onCommand}
        history={history}
        historyIndex={-1}
      />
    );
    const input = screen.getByRole("textbox");

    // Go up, then down — should clear (back to empty)
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/clear");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("");
  });

  it("navigates history correctly with multiple ↑ presses", () => {
    const onCommand = vi.fn();
    const history = ["/help", "/clear", "/about"];
    render(
      <TerminalPrompt
        onCommand={onCommand}
        history={history}
        historyIndex={-1}
      />
    );
    const input = screen.getByRole("textbox");

    // First ↑ → last item
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/about");

    // Second ↑ → second-to-last
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/clear");

    // Third ↑ → first
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/help");

    // Fourth ↑ → stays at first
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/help");
  });
});
