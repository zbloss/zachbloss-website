/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { vi } from "vitest";
import { useRouter } from "next/navigation";

// Mock matchMedia for mobile detection
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
  it("renders shortcut buttons above TerminalPrompt when on mobile", () => {
    vi.mocked(window.matchMedia).mockImplementation((query) => ({
      matches: query.includes("(max-width: 768px)"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<TerminalLayout><div>content</div></TerminalLayout>);

    // Shortcut buttons are present when mobile
    expect(screen.getByText("/help")).toBeInTheDocument();
  });

  it("does not render shortcut buttons when not on mobile", () => {
    vi.mocked(window.matchMedia).mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<TerminalLayout><div>content</div></TerminalLayout>);

    // Shortcut buttons are absent when not mobile
    expect(screen.queryByText("/help")).not.toBeInTheDocument();
  });

  it("shortcut buttons trigger navigation via router.push", () => {
    vi.mocked(window.matchMedia).mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { push } = vi.mocked(useRouter());

    render(<TerminalLayout><div>content</div></TerminalLayout>);

    // Click a shortcut button
    const helpButton = screen.getByText("/help");
    fireEvent.click(helpButton);

    // Should navigate to /help
    expect(push).toHaveBeenCalledWith("/help");
  });
});
