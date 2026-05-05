/// <reference types="vitest/globals" />

import { resolveCommand, KNOWN_COMMANDS } from "@/app/lib/commandRouter";

describe("resolveCommand", () => {
  describe("known commands", () => {
    it("resolves /help to the help route", () => {
      const result = resolveCommand("/help");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/help");
      }
    });

    it("resolves /clear to the clear action", () => {
      const result = resolveCommand("/clear");
      expect(result.type).toBe("clear");
    });

    it("is case-insensitive — /HELP resolves the same as /help", () => {
      const result = resolveCommand("/HELP");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/help");
      }
    });

    it("is case-insensitive — /Clear resolves the same as /clear", () => {
      const result = resolveCommand("/Clear");
      expect(result.type).toBe("clear");
    });
  });

  describe("unknown commands", () => {
    it("returns an error for unknown /command", () => {
      const result = resolveCommand("/foobar");
      expect(result.type).toBe("error");
      if (result.type === "error") {
        expect(result.message).toContain("foobar");
      }
    });

    it("returns an error for /unknown", () => {
      const result = resolveCommand("/unknown");
      expect(result.type).toBe("error");
      if (result.type === "error") {
        expect(result.message).toContain("unknown");
      }
    });
  });

  describe("plain-text input (no / prefix)", () => {
    it("returns a stub result for plain text", () => {
      const result = resolveCommand("hello world");
      expect(result.type).toBe("stub");
      if (result.type === "stub") {
        expect(result.message).toBeDefined();
      }
    });

    it("returns a stub result for empty string", () => {
      const result = resolveCommand("");
      expect(result.type).toBe("stub");
    });
  });
});

describe("KNOWN_COMMANDS", () => {
  it("exports an array of command definitions", () => {
    expect(Array.isArray(KNOWN_COMMANDS)).toBe(true);
    expect(KNOWN_COMMANDS.length).toBeGreaterThan(0);
  });

  it("includes /help with a description", () => {
    const helpCmd = KNOWN_COMMANDS.find(c => c.command === "/help");
    expect(helpCmd).toBeDefined();
    expect(helpCmd?.description).toBeDefined();
    expect(helpCmd?.description).toBeTruthy();
  });

  it("includes /clear with a description", () => {
    const clearCmd = KNOWN_COMMANDS.find(c => c.command === "/clear");
    expect(clearCmd).toBeDefined();
    expect(clearCmd?.description).toBeDefined();
    expect(clearCmd?.description).toBeTruthy();
  });
});
