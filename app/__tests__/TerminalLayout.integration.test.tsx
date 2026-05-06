/// <reference types="vitest/globals" />

import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { HelpOutput } from "@/app/components/HelpOutput";
import { vi } from "vitest";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", async () => {
  return {
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
  };
});

// Mock IntentResolver to return null for untrusted input (below threshold)
vi.mock("@/app/lib/intentResolver", () => ({
  getIntentResolver: vi.fn(() => ({
    isReady: () => true,
    resolve: vi.fn(async () => null),
  })),
  resolve: vi.fn(async () => null),
}));

// Mock AssistantStatus to always show "ready"
vi.mock("@/app/components/AssistantStatus", () => ({
  AssistantStatus: () => <span>assistant ready</span>,
}));

describe("TerminalLayout integration", () => {
  it("renders TerminalPrompt with the input field and prompt character", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    expect(screen.getByText("❯")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders children inside the TerminalBody", () => {
    render(<TerminalLayout><HelpOutput /></TerminalLayout>);
    expect(screen.getByText(/Available Commands/)).toBeInTheDocument();
  });

  it("routes unknown /command through IntentResolver", async () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "/foobar" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Unknown command goes through IntentResolver
    expect(
      screen.getByText(/I'm not sure what you mean/)
    ).toBeInTheDocument();
  });

  it("renders stub message for plain text input", async () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "hello world" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(
      screen.getByText(/I'm not sure what you mean/)
    ).toBeInTheDocument();
  });

  it("resolves /clear to a clear action and pushes to /clear route", () => {
    const { push } = vi.mocked(useRouter)();
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "/clear" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/clear");
  });

  it("clears the input after submitting a command", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("");
  });

  it("shows assistant status indicator", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    expect(screen.getByText(/assistant ready|loading assistant/)).toBeInTheDocument();
  });
});
