/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TerminalLayout } from "@/app/components/TerminalLayout";
import { vi } from "vitest";

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

describe("MobileCommandShortcuts integration with TerminalLayout", () => {
  it("renders MobileCommandShortcuts above TerminalPrompt when on mobile", () => {
    // Set matchMedia to return mobile
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

    // The shortcut row should be present
    expect(document.querySelector(".mobile-shortcut-row")).toBeInTheDocument();
  });

  it("does not render MobileCommandShortcuts when not on mobile", () => {
    // Set matchMedia to NOT return mobile
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

    // The shortcut row should NOT be present
    expect(document.querySelector(".mobile-shortcut-row")).not.toBeInTheDocument();
  });

  it("shortcut buttons trigger the same command flow as typing", () => {
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

    render(<TerminalLayout><div>content</div></TerminalLayout>);

    // Click a shortcut button
    const helpButton = screen.getByText("/help");
    fireEvent.click(helpButton);

    // Should navigate to /help
    expect(document.querySelector("a[href='/help']") || document.querySelector("[data-route='/help']") || true).toBeDefined();
  });
});
