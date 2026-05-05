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

    it("resolves /about to the about route", () => {
      const result = resolveCommand("/about");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/about");
      }
    });

    it("resolves /projects to the projects route", () => {
      const result = resolveCommand("/projects");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/projects");
      }
    });

    it("resolves /certifications to the certifications route", () => {
      const result = resolveCommand("/certifications");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/certifications");
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

  it("includes /about with a description", () => {
    const aboutCmd = KNOWN_COMMANDS.find(c => c.command === "/about");
    expect(aboutCmd).toBeDefined();
    expect(aboutCmd?.description).toBeDefined();
    expect(aboutCmd?.description).toBeTruthy();
    expect(aboutCmd?.route).toBe("/about");
  });

  it("includes /projects with a description", () => {
    const projectsCmd = KNOWN_COMMANDS.find(c => c.command === "/projects");
    expect(projectsCmd).toBeDefined();
    expect(projectsCmd?.description).toBeDefined();
    expect(projectsCmd?.description).toBeTruthy();
    expect(projectsCmd?.route).toBe("/projects");
  });

  it("includes /certifications with a description", () => {
    const certsCmd = KNOWN_COMMANDS.find(c => c.command === "/certifications");
    expect(certsCmd).toBeDefined();
    expect(certsCmd?.description).toBeDefined();
    expect(certsCmd?.description).toBeTruthy();
    expect(certsCmd?.route).toBe("/certifications");
  });

  it("includes /clear with a description", () => {
    const clearCmd = KNOWN_COMMANDS.find(c => c.command === "/clear");
    expect(clearCmd).toBeDefined();
    expect(clearCmd?.description).toBeDefined();
    expect(clearCmd?.description).toBeTruthy();
  });
});
