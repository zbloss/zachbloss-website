/// <reference types="vitest/globals" />

import { vi } from "vitest";
import { cosineSimilarity, IntentResolver, resolve, wordBagEmbedding } from "@/app/lib/intentResolver";
import { KNOWN_COMMANDS } from "@/app/lib/commandRouter";

// Make @xenova/transformers fail immediately in tests so word-bag fallback
// is used without network access or long waits.
vi.mock("@xenova/transformers", () => ({
  pipeline: vi.fn().mockRejectedValue(new Error("model not available in tests")),
}));

// ---------------------------------------------------------------------------
// Cosine similarity tests
// ---------------------------------------------------------------------------

describe("cosineSimilarity", () => {
  it("returns 1.0 for identical vectors", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBe(1.0);
  });

  it("returns -1.0 for opposite vectors", () => {
    const a = [1, 2, 3];
    const b = [-1, -2, -3];
    expect(cosineSimilarity(a, b)).toBe(-1.0);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(cosineSimilarity(a, b)).toBe(0.0);
  });

  it("returns 0 for empty vectors", () => {
    expect(cosineSimilarity([], [])).toBe(0.0);
  });

  it("handles different lengths by using the shorter length", () => {
    const a = [1, 2, 3, 4];
    const b = [1, 2];
    const sim = cosineSimilarity(a, b);
    // [1,2] dot [1,2] = 5, |a|=sqrt(5), |b|=sqrt(5) => 5/5 = 1.0
    expect(sim).toBeCloseTo(1.0, 10);
  });
});

// ---------------------------------------------------------------------------
// IntentResolver class
// ---------------------------------------------------------------------------

describe("IntentResolver class", () => {
  const commands = [
    { command: "/help", description: "Show available commands", route: "/help" },
    { command: "/about", description: "View background and skills", route: "/about" },
    { command: "/projects", description: "View portfolio projects", route: "/projects" },
    { command: "/certifications", description: "View professional certifications", route: "/certifications" },
    { command: "/clear", description: "Clear terminal output", action: "clear" as const },
  ];

  describe("model loading", () => {
    it("is not ready immediately after construction", () => {
      const resolver = new IntentResolver(commands, 0);
      expect(resolver.isReady()).toBe(false);
    });
  });

  describe("resolve() interface", () => {
    it("returns a Promise", () => {
      const resolver = new IntentResolver(commands, 0);
      const result = resolver.resolve("show me your work");
      expect(result).toBeInstanceOf(Promise);
    });

    it("returns { command, confidence } on successful match", async () => {
      const resolver = new IntentResolver(commands, 0);
      const result = await resolver.resolve("show me your work");
      if (result) {
        expect(result).toHaveProperty("command");
        expect(result).toHaveProperty("confidence");
        expect(typeof result.command).toBe("string");
        expect(typeof result.confidence).toBe("number");
      }
    });

    it("handles empty string input", async () => {
      const resolver = new IntentResolver(commands, 0);
      const result = await resolver.resolve("");
      if (result) {
        expect(result.command).toBeDefined();
        expect(result.confidence).toBeDefined();
      }
    });

    it("handles single character input", async () => {
      const resolver = new IntentResolver(commands, 0);
      const result = await resolver.resolve("x");
      if (result) {
        expect(result.command).toBeDefined();
        expect(result.confidence).toBeDefined();
      }
    });

    it("handles input that is itself a valid command", async () => {
      const resolver = new IntentResolver(commands, 0);
      const result = await resolver.resolve("/projects");
      if (result) {
        expect(result.command).toBeDefined();
        expect(result.confidence).toBeDefined();
      }
    });
  });

  describe("resolve called before model ready", () => {
    it("does not crash and resolves after model is ready", async () => {
      const resolver = new IntentResolver(commands, 3000);
      // Immediately call resolve before model is ready
      const promise = resolver.resolve("show me your work");
      // Should not throw
      const result = await promise;
      // Should complete successfully (either with a match or null)
      expect(result).toBeDefined();
    });
  });

  describe("mock embeddings", () => {
    it("uses mock embeddings when set", async () => {
      const resolver = new IntentResolver(commands, 0);

      // Create embeddings where "show me your work" is very similar to /projects
      const projectEmbedding = [0.8, 0.5, 0.3, 0.1];
      const aboutEmbedding = [0.1, 0.8, 0.2, 0.1];
      const inputEmbedding = [0.7, 0.5, 0.3, 0.1]; // Close to project

      const mockCmdEmbeddings = new Map([
        ["/projects", projectEmbedding],
        ["/about", aboutEmbedding],
        ["/help", [0.2, 0.3, 0.8, 0.1]],
        ["/certifications", [0.1, 0.2, 0.7, 0.1]],
        ["/clear", [0.3, 0.1, 0.1, 0.8]],
      ]);

      resolver.setMockEmbeddings(() => inputEmbedding, mockCmdEmbeddings);

      const result = await resolver.resolve("show me your work");
      expect(result).not.toBeNull();
      expect(result?.command).toBe("/projects");
      expect(result?.confidence).toBeCloseTo(cosineSimilarity(inputEmbedding, projectEmbedding), 6);
    });

    it("isReady returns true after mock embeddings are set", () => {
      const resolver = new IntentResolver(commands, 0);
      expect(resolver.isReady()).toBe(false);

      resolver.setMockEmbeddings(() => [0.1], new Map());
      expect(resolver.isReady()).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// High-confidence matching (with mock embeddings)
// ---------------------------------------------------------------------------

describe("high-confidence matching", () => {
  const commands = [
    { command: "/help", description: "Show available commands", route: "/help" },
    { command: "/about", description: "View background and skills", route: "/about" },
    { command: "/projects", description: "View portfolio projects", route: "/projects" },
    { command: "/certifications", description: "View professional certifications", route: "/certifications" },
    { command: "/clear", description: "Clear terminal output", action: "clear" as const },
  ];

  it('input similar to /projects description returns /projects with confidence ≥ 0.85', async () => {
    const resolver = new IntentResolver(commands, 0);

    // Create embeddings where "show me your work" (input) is very similar to /projects
    const projectVec = [0.8, 0.5, 0.3, 0.1, 0.2];
    const aboutVec = [0.1, 0.8, 0.2, 0.1, 0.1];
    const helpVec = [0.3, 0.2, 0.8, 0.1, 0.1];
    const certsVec = [0.1, 0.3, 0.2, 0.7, 0.1];
    const clearVec = [0.2, 0.1, 0.1, 0.1, 0.8];

    // Input embedding: similar to projects (show me your work -> portfolio)
    const inputVec = [0.7, 0.5, 0.3, 0.15, 0.2];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
      ["/certifications", certsVec],
      ["/clear", clearVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("show me your work");
    expect(result).not.toBeNull();
    expect(result?.command).toBe("/projects");
    expect(result?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('input similar to /about description returns /about with confidence ≥ 0.85', async () => {
    const resolver = new IntentResolver(commands, 0);

    const projectVec = [0.1, 0.8, 0.3, 0.1, 0.2];
    const aboutVec = [0.7, 0.6, 0.2, 0.1, 0.1];
    const helpVec = [0.3, 0.2, 0.8, 0.1, 0.1];
    const certsVec = [0.1, 0.3, 0.2, 0.7, 0.1];
    const clearVec = [0.2, 0.1, 0.1, 0.1, 0.8];

    // Input: similar to about (tell me about yourself -> background)
    const inputVec = [0.6, 0.7, 0.1, 0.1, 0.1];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
      ["/certifications", certsVec],
      ["/clear", clearVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("tell me about yourself");
    expect(result).not.toBeNull();
    expect(result?.command).toBe("/about");
    expect(result?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('input similar to /clear description returns /clear with confidence ≥ 0.85', async () => {
    const resolver = new IntentResolver(commands, 0);

    const projectVec = [0.1, 0.8, 0.3, 0.1, 0.2];
    const aboutVec = [0.7, 0.6, 0.2, 0.1, 0.1];
    const helpVec = [0.3, 0.2, 0.8, 0.1, 0.1];
    const certsVec = [0.1, 0.3, 0.2, 0.7, 0.1];
    const clearVec = [0.2, 0.1, 0.1, 0.1, 0.9];

    // Input: similar to clear (clear the screen -> terminal output)
    const inputVec = [0.2, 0.1, 0.05, 0.1, 0.85];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
      ["/certifications", certsVec],
      ["/clear", clearVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("clear the screen");
    expect(result).not.toBeNull();
    expect(result?.command).toBe("/clear");
    expect(result?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it("picks the highest-confidence match when multiple commands have moderate similarity", async () => {
    const resolver = new IntentResolver(commands, 0);

    const projectVec = [0.5, 0.5, 0.5, 0.5, 0.5];
    const aboutVec = [0.6, 0.6, 0.4, 0.3, 0.5];
    const helpVec = [0.4, 0.4, 0.6, 0.4, 0.4];
    const certsVec = [0.3, 0.3, 0.3, 0.7, 0.3];
    const clearVec = [0.2, 0.2, 0.2, 0.2, 0.8];

    // Input: moderately similar to about but clearly closest to about
    const inputVec = [0.5, 0.7, 0.3, 0.2, 0.4];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
      ["/certifications", certsVec],
      ["/clear", clearVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("about yourself");
    expect(result).not.toBeNull();
    expect(result?.command).toBe("/about");
  });
});

// ---------------------------------------------------------------------------
// Low-confidence matching (with mock embeddings)
// ---------------------------------------------------------------------------

describe("low-confidence matching", () => {
  const commands = [
    { command: "/help", description: "Show available commands", route: "/help" },
    { command: "/about", description: "View background and skills", route: "/about" },
    { command: "/projects", description: "View portfolio projects", route: "/projects" },
  ];

  it("completely unrelated gibberish returns null", async () => {
    const resolver = new IntentResolver(commands, 0);

    // Create embeddings that are all orthogonal to the input
    const projectVec = [0.9, 0.3, 0.1];
    const aboutVec = [0.1, 0.9, 0.3];
    const helpVec = [0.3, 0.1, 0.9];

    // Input embedding: orthogonal to all commands
    const inputVec = [0.0, 0.0, 0.0];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("xyzwq random noise blah");
    expect(result).toBeNull();
  });

  it("unrelated input with non-zero vector returns best match with low confidence", async () => {
    const resolver = new IntentResolver(commands, 0);

    const projectVec = [0.9, 0.1, 0.1, 0.15, 0.1];
    const aboutVec = [0.1, 0.9, 0.1, 0.1, 0.1];
    const helpVec = [0.1, 0.1, 0.9, 0.1, 0.1];

    // Input: very different from all commands
    const inputVec = [0.05, 0.05, 0.05, 0.9, 0.05];

    const mockCmdEmbeddings = new Map([
      ["/projects", projectVec],
      ["/about", aboutVec],
      ["/help", helpVec],
    ]);

    resolver.setMockEmbeddings(() => inputVec, mockCmdEmbeddings);

    const result = await resolver.resolve("what is the weather like today");
    // Returns the best match (not null) but with low confidence (< 0.50)
    expect(result).not.toBeNull();
    expect(result?.confidence).toBeLessThan(0.50);
  });
});

// ---------------------------------------------------------------------------
// Convenience function
// ---------------------------------------------------------------------------

describe("resolve() convenience function", () => {
  it("exports a convenience function that wraps IntentResolver", () => {
    expect(typeof resolve).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// wordBagEmbedding export
// ---------------------------------------------------------------------------

describe("wordBagEmbedding", () => {
  it("is exported from intentResolver", () => {
    expect(typeof wordBagEmbedding).toBe("function");
  });

  it("returns a normalized vector of the specified dimension", () => {
    const vec = wordBagEmbedding("hello world", 10);
    expect(vec).toHaveLength(10);
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 4);
  });

  it("same text always produces similarity = 1.0 with itself", () => {
    const a = wordBagEmbedding("projects", 384);
    const b = wordBagEmbedding("projects", 384);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0);
  });
});

// ---------------------------------------------------------------------------
// Multi-anchor word-bag quality — ticket examples
// ---------------------------------------------------------------------------
//
// These tests verify that obvious user inputs reach ≥ 0.85 similarity against
// at least one of the alias anchor texts defined in KNOWN_COMMANDS, using the
// word-bag embedding. They run synchronously against the embedding function
// directly, so model loading is not involved.
//
// If you add a new obvious input that should auto-navigate, add it here AND
// add the matching alias to KNOWN_COMMANDS in commandRouter.ts.
// ---------------------------------------------------------------------------

describe("multi-anchor word-bag quality — obvious inputs reach ≥ 0.85", () => {
  const DIM = 384;

  function maxAnchorSim(input: string, anchors: string[]): number {
    const inputEmb = wordBagEmbedding(input, DIM);
    return Math.max(...anchors.map((a) => cosineSimilarity(inputEmb, wordBagEmbedding(a, DIM))));
  }

  function anchorsFor(command: string): string[] {
    const cmd = KNOWN_COMMANDS.find((c) => c.command === command);
    if (!cmd) throw new Error(`Command ${command} not found in KNOWN_COMMANDS`);
    return [
      cmd.command.slice(1),
      cmd.description,
      ...(cmd.aliases ?? []),
    ].filter(Boolean);
  }

  // --- Ticket examples ---

  it('"projects" reaches ≥ 0.85 against /projects anchors', () => {
    expect(maxAnchorSim("projects", anchorsFor("/projects"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"show me projects" reaches ≥ 0.85 against /projects anchors', () => {
    expect(maxAnchorSim("show me projects", anchorsFor("/projects"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"help" reaches ≥ 0.85 against /help anchors', () => {
    expect(maxAnchorSim("help", anchorsFor("/help"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"blog" reaches ≥ 0.85 against /blog anchors', () => {
    expect(maxAnchorSim("blog", anchorsFor("/blog"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"show me blog posts" reaches ≥ 0.85 against /blog anchors', () => {
    expect(maxAnchorSim("show me blog posts", anchorsFor("/blog"))).toBeGreaterThanOrEqual(0.85);
  });

  // --- Additional obvious inputs for each page ---

  it('"about" reaches ≥ 0.85 against /about anchors', () => {
    expect(maxAnchorSim("about", anchorsFor("/about"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"about me" reaches ≥ 0.85 against /about anchors', () => {
    expect(maxAnchorSim("about me", anchorsFor("/about"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"who are you" reaches ≥ 0.85 against /about anchors', () => {
    expect(maxAnchorSim("who are you", anchorsFor("/about"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"certifications" reaches ≥ 0.85 against /certifications anchors', () => {
    expect(maxAnchorSim("certifications", anchorsFor("/certifications"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"certs" reaches ≥ 0.85 against /certifications anchors', () => {
    expect(maxAnchorSim("certs", anchorsFor("/certifications"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"certificates" reaches ≥ 0.85 against /certifications anchors', () => {
    expect(maxAnchorSim("certificates", anchorsFor("/certifications"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"contact" reaches ≥ 0.85 against /contact anchors', () => {
    expect(maxAnchorSim("contact", anchorsFor("/contact"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"contact me" reaches ≥ 0.85 against /contact anchors', () => {
    expect(maxAnchorSim("contact me", anchorsFor("/contact"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"get in touch" reaches ≥ 0.85 against /contact anchors', () => {
    expect(maxAnchorSim("get in touch", anchorsFor("/contact"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"latest" reaches ≥ 0.85 against /latest anchors', () => {
    expect(maxAnchorSim("latest", anchorsFor("/latest"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"recent commits" reaches ≥ 0.85 against /latest anchors', () => {
    expect(maxAnchorSim("recent commits", anchorsFor("/latest"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"commits" reaches ≥ 0.85 against /latest anchors', () => {
    expect(maxAnchorSim("commits", anchorsFor("/latest"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"clear" reaches ≥ 0.85 against /clear anchors', () => {
    expect(maxAnchorSim("clear", anchorsFor("/clear"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"clear screen" reaches ≥ 0.85 against /clear anchors', () => {
    expect(maxAnchorSim("clear screen", anchorsFor("/clear"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"home" reaches ≥ 0.85 against /home anchors', () => {
    expect(maxAnchorSim("home", anchorsFor("/home"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"homepage" reaches ≥ 0.85 against /home anchors', () => {
    expect(maxAnchorSim("homepage", anchorsFor("/home"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"portfolio" reaches ≥ 0.85 against /projects anchors', () => {
    expect(maxAnchorSim("portfolio", anchorsFor("/projects"))).toBeGreaterThanOrEqual(0.85);
  });

  it('"commands" reaches ≥ 0.85 against /help anchors', () => {
    expect(maxAnchorSim("commands", anchorsFor("/help"))).toBeGreaterThanOrEqual(0.85);
  });
});

// ---------------------------------------------------------------------------
// End-to-end routing with word-bag fallback — ticket examples against KNOWN_COMMANDS
// ---------------------------------------------------------------------------
//
// These tests run the full IntentResolver flow (loadDelay=0, @xenova mocked
// to fail → word-bag fallback) against the real KNOWN_COMMANDS configuration.
// They assert that obvious inputs route to the correct command with confidence
// ≥ 0.85 (auto-navigate threshold).
// ---------------------------------------------------------------------------

describe("end-to-end word-bag routing — ticket examples (KNOWN_COMMANDS)", () => {
  it.each([
    // Ticket examples
    ["projects", "/projects"],
    ["show me projects", "/projects"],
    ["help", "/help"],
    ["blog", "/blog"],
    ["show me blog posts", "/blog"],
    // Additional obvious inputs per page
    ["about", "/about"],
    ["about me", "/about"],
    ["who are you", "/about"],
    ["certifications", "/certifications"],
    ["certs", "/certifications"],
    ["contact", "/contact"],
    ["contact me", "/contact"],
    ["get in touch", "/contact"],
    ["latest", "/latest"],
    ["recent commits", "/latest"],
    ["clear", "/clear"],
    ["clear screen", "/clear"],
    ["home", "/home"],
    ["portfolio", "/projects"],
    ["commands", "/help"],
  ] as [string, string][])(
    '"%s" resolves to %s with confidence ≥ 0.85',
    async (input, expectedCommand) => {
      const resolver = new IntentResolver(KNOWN_COMMANDS, 0);
      const result = await resolver.resolve(input);
      expect(result?.command).toBe(expectedCommand);
      expect(result?.confidence).toBeGreaterThanOrEqual(0.85);
    }
  );
});
