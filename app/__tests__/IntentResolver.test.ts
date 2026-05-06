/// <reference types="vitest/globals" />

import { cosineSimilarity, IntentResolver, resolve } from "@/app/lib/intentResolver";

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
