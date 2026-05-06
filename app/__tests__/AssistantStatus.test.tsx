/// <reference types="vitest/globals" />

import { render, screen, waitFor } from "@testing-library/react";
import { AssistantStatus } from "@/app/components/AssistantStatus";

// Mock getIntentResolver to return a resolver that's immediately ready
vi.mock("@/app/lib/intentResolver", () => ({
  getIntentResolver: vi.fn(() => ({
    isReady: () => true,
  })),
}));

vi.mock("@/app/lib/commandRouter", () => ({
  KNOWN_COMMANDS: [
    { command: "/help", description: "Show available commands", route: "/help" },
  ],
}));

describe("AssistantStatus", () => {
  it("initially shows loading state", () => {
    render(<AssistantStatus />);
    expect(screen.getByText("loading assistant…")).toBeInTheDocument();
  });

  it("transitions to ready state when model is ready", async () => {
    render(<AssistantStatus />);
    await waitFor(() => {
      expect(screen.getByText("assistant ready")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("has aria-live for screen readers", () => {
    render(<AssistantStatus />);
    const el = screen.getByText(/loading assistant…|assistant ready/);
    expect(el).toHaveAttribute("aria-live", "polite");
  });
});
