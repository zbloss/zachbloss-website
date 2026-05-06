/// <reference types="vitest/globals" />

import { resolveCommand, KNOWN_COMMANDS } from "@/app/lib/commandRouter";
import { IntentResolver } from "@/app/lib/intentResolver";
import { vi } from "vitest";



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

// ---------------------------------------------------------------------------
// resolveCommandAsync — async resolution with IntentResolver wiring
// ---------------------------------------------------------------------------

describe("resolveCommandAsync", () => {
  // Shared command set for async tests
  const asyncCommands = [
    { command: "/help", description: "Show available commands", route: "/help" },
    { command: "/about", description: "View background and skills", route: "/about" },
    { command: "/projects", description: "View portfolio projects", route: "/projects" },
    { command: "/certifications", description: "View professional certifications", route: "/certifications" },
    { command: "/clear", description: "Clear terminal output", action: "clear" as const },
  ];

  function createMockResolver(
    inputVec: number[],
    cmdEmbeddings: Map<string, number[]>,
  ) {
    const resolver = new IntentResolver(asyncCommands);
    resolver.setMockEmbeddings(() => inputVec, cmdEmbeddings);
    return resolver;
  }

  describe("high-confidence IntentResolver result triggers navigation", () => {
    it("plain-text 'show me your work' resolves to /projects with confidence >= 0.85 → navigate", async () => {
      const mockResolver = createMockResolver([0.7, 0.5, 0.3, 0.15, 0.2], new Map([
        ["/projects", [0.8, 0.5, 0.3, 0.1, 0.2]],
        ["/about", [0.1, 0.8, 0.2, 0.1, 0.1]],
        ["/help", [0.3, 0.2, 0.8, 0.1, 0.1]],
        ["/certifications", [0.1, 0.3, 0.2, 0.7, 0.1]],
        ["/clear", [0.2, 0.1, 0.1, 0.1, 0.8]],
      ]));

      const intentResolverModule = await import("@/app/lib/intentResolver");
      vi.spyOn(intentResolverModule, "getIntentResolver").mockReturnValue(mockResolver);

      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("show me your work", asyncCommands);
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/projects");
      }
    });
  });

  describe("mid-confidence result prints suggestion text without navigating", () => {
    it("plain-text with confidence 0.50-0.84 → type 'suggest' with command name", async () => {
      const mockResolver = createMockResolver([0.1, 0.25, 0.2, 0.4, 0.1, 0.1, 0.1, 0.0], new Map([
        ["/projects", [0.9, 0.3, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]],
        ["/about", [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25]],
        ["/help", [0.2, 0.15, 0.6, 0.1, 0.1, 0.1, 0.1, 0.1]],
        ["/certifications", [0.1, 0.2, 0.15, 0.1, 0.8, 0.1, 0.1, 0.1]],
        ["/clear", [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9]],
      ]));

      const intentResolverModule = await import("@/app/lib/intentResolver");
      vi.spyOn(intentResolverModule, "getIntentResolver").mockReturnValue(mockResolver);

      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("about yourself", asyncCommands);
      expect(result.type).toBe("suggest");
      if (result.type === "suggest") {
        expect(result.command).toBe("/about");
        expect(result.message).toContain("/about");
      }
    });
  });

  describe("low-confidence result prints the 'try /help' message", () => {
    it("plain-text with confidence < 0.50 → stub with 'try /help' message", async () => {
      const mockResolver = createMockResolver([0.0, 0.0, 0.0], new Map([
        ["/projects", [0.9, 0.3, 0.1]],
        ["/about", [0.1, 0.9, 0.3]],
        ["/help", [0.3, 0.1, 0.9]],
        ["/certifications", [0.2, 0.2, 0.7]],
        ["/clear", [0.1, 0.1, 0.8]],
      ]));

      const intentResolverModule = await import("@/app/lib/intentResolver");
      vi.spyOn(intentResolverModule, "getIntentResolver").mockReturnValue(mockResolver);

      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("xyzwq random noise blah", asyncCommands);
      expect(result.type).toBe("stub");
      if (result.type === "stub") {
        expect(result.message).toContain("/help");
        expect(result.message).toContain("not sure");
      }
    });
  });

  describe("plain-text input always goes to IntentResolver (never direct-routes)", () => {
    it("plain text is never matched as a known command — always goes through IntentResolver", async () => {
      // Verify that plain text "show me your work" does NOT match a known command directly
      const directResult = resolveCommand("show me your work");
      expect(directResult.type).not.toBe("navigate");
      expect(directResult.type).not.toBe("clear");
      // It should return stub/error since it's not a known /command
      expect(["stub", "error"]).toContain(directResult.type);
    });

    it("plain-text resolves via IntentResolver, not as an error", async () => {
      const mockResolver = createMockResolver([0.7, 0.5, 0.3, 0.15, 0.2], new Map([
        ["/projects", [0.8, 0.5, 0.3, 0.1, 0.2]],
        ["/about", [0.1, 0.8, 0.2, 0.1, 0.1]],
        ["/help", [0.3, 0.2, 0.8, 0.1, 0.1]],
        ["/certifications", [0.1, 0.3, 0.2, 0.7, 0.1]],
        ["/clear", [0.2, 0.1, 0.1, 0.1, 0.8]],
      ]));

      const intentResolverModule = await import("@/app/lib/intentResolver");
      vi.spyOn(intentResolverModule, "getIntentResolver").mockReturnValue(mockResolver);

      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("show me your work", asyncCommands);
      // Should NOT be an error — IntentResolver should handle it
      expect(result.type).not.toBe("error");
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/projects");
      }
    });
  });

  describe("unknown /command goes to IntentResolver (not a hard error)", () => {
    it("unknown /command delegates to IntentResolver instead of hard error", async () => {
      // Direct resolution of unknown command should give an error
      const directResult = resolveCommand("/foobar");
      expect(directResult.type).toBe("error");

      // resolveCommandAsync should try IntentResolver for unknown /commands
      const mockResolver = createMockResolver([0.3, 0.4, 0.2, 0.2, 0.1], new Map([
        ["/projects", [0.8, 0.5, 0.3, 0.1, 0.2]],
        ["/about", [0.1, 0.8, 0.2, 0.1, 0.1]],
        ["/help", [0.3, 0.2, 0.8, 0.1, 0.1]],
        ["/certifications", [0.1, 0.3, 0.2, 0.7, 0.1]],
        ["/clear", [0.2, 0.1, 0.1, 0.1, 0.8]],
      ]));

      const intentResolverModule = await import("@/app/lib/intentResolver");
      vi.spyOn(intentResolverModule, "getIntentResolver").mockReturnValue(mockResolver);

      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("/foobar", asyncCommands);
      // Should NOT be an error — IntentResolver should handle it
      expect(result.type).not.toBe("error");
    });

    it("known /commands still resolve synchronously without calling IntentResolver", async () => {
      const { resolveCommandAsync } = await import("@/app/lib/commandRouter");
      const result = await resolveCommandAsync("/help", asyncCommands);
      expect(result.type).toBe("navigate");
      if (result.type === "navigate") {
        expect(result.route).toBe("/help");
      }
    });
  });
});
