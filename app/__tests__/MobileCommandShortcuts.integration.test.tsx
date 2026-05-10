/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { vi } from "vitest";
import { useRouter } from "next/navigation";

// Mock matchMedia (no longer drives shortcut visibility, but TerminalLayout still references window)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Next.js router
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

describe("MobileCommandShortcuts integration with TerminalLayout", () => {
  it("always renders shortcut buttons above TerminalPrompt", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    expect(screen.getByText("/help")).toBeInTheDocument();
  });

  it("shortcut buttons trigger navigation via router.push", () => {
    const { push } = vi.mocked(useRouter());

    render(<TerminalLayout><div>content</div></TerminalLayout>);

    const helpButton = screen.getByText("/help");
    fireEvent.click(helpButton);

    expect(push).toHaveBeenCalledWith("/help");
  });

  it("renders all known command buttons", () => {
    render(<TerminalLayout><div>content</div></TerminalLayout>);
    expect(screen.getByText("/home")).toBeInTheDocument();
    expect(screen.getByText("/projects")).toBeInTheDocument();
    expect(screen.getByText("/clear")).toBeInTheDocument();
  });
});
