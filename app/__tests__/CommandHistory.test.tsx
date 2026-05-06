/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { vi } from "vitest";

vi.mock("next/navigation", async () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue("/"),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

describe("Command History (in TerminalLayout)", () => {
  it("adds submitted commands to history", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    // Type and submit first command
    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Type and submit second command
    fireEvent.change(input, { target: { value: "/clear" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Navigate up — should show the most recent command
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/clear");

    // Navigate up again — should show the first command
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/help");
  });

  it("clears history browsing when user starts typing", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    // Submit a command
    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Browse to it
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/help");

    // Start typing something new
    fireEvent.change(input, { target: { value: "/c" } });
    expect(input).toHaveValue("/c");
  });

  it("does not persist history across page loads (session-only)", () => {
    // TerminalLayout manages history as local state, so each mount starts fresh.
    // We verify this by checking that a fresh mount has empty history.
    const { unmount } = render(
      <TerminalLayout><div>content</div></TerminalLayout>
    );
    const input = screen.getByRole("textbox");

    // Submit a command
    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Navigate up — should show the command
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("/help");

    // Unmount (simulating page load)
    unmount();

    // Verify history does not persist: create a brand new render.
    // If history were persisted, ArrowUp would show "/help".
    // Since history is local, ArrowUp shows nothing.
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const newInput = screen.getByRole("textbox");

    // ArrowUp on a fresh mount — history is empty, so nothing to navigate to.
    fireEvent.keyDown(newInput, { key: "ArrowUp" });
    expect(newInput).toHaveValue("");
  });
});
