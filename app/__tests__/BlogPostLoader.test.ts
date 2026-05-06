/// <reference types="vitest/globals" />

import { readPosts, parseFrontmatter, getPostBySlug, BlogPost } from "@/app/lib/blogPostLoader";

describe("parseFrontmatter", () => {
  it("parses valid markdown with frontmatter", () => {
    const md = `---
title: My First Post
date: 2024-01-15
slug: my-first-post
excerpt: This is the first blog post.

---

Hello world!

This is the body of my first blog post.`;

    const result = parseFrontmatter(md);
    expect(result).toEqual({
      title: "My First Post",
      date: "2024-01-15",
      slug: "my-first-post",
      excerpt: "This is the first blog post.",
      body: "\nHello world!\n\nThis is the body of my first blog post.",
    });
  });

  it("handles missing optional fields with defaults", () => {
    const md = `---
title: Simple Post
date: 2024-03-01
slug: simple-post

---

Just a simple post.`;

    const result = parseFrontmatter(md);
    expect(result.title).toBe("Simple Post");
    expect(result.date).toBe("2024-03-01");
    expect(result.slug).toBe("simple-post");
    expect(result.excerpt).toBe("");
  });

  it("returns empty fields for malformed frontmatter", () => {
    const md = `---broken
This is not valid frontmatter.

---

Some content.`;

    const result = parseFrontmatter(md);
    expect(result).toEqual({
      title: "",
      date: "",
      slug: "",
      excerpt: "",
      body: `---broken
This is not valid frontmatter.

---

Some content.`,
    });
  });

  it("handles completely empty markdown", () => {
    const result = parseFrontmatter("");
    expect(result).toEqual({
      title: "",
      date: "",
      slug: "",
      excerpt: "",
      body: "",
    });
  });

  it("handles markdown with no frontmatter at all", () => {
    const md = `# No Frontmatter

This post has no frontmatter fields.`;

    const result = parseFrontmatter(md);
    expect(result.title).toBe("");
    expect(result.date).toBe("");
    expect(result.slug).toBe("");
    expect(result.excerpt).toBe("");
  });
});

describe("readPosts", () => {
  it("returns posts sorted by date descending", () => {
    const posts = [
      { title: "Old Post", date: "2024-01-01", slug: "old", excerpt: "Old" },
      { title: "New Post", date: "2024-06-15", slug: "new", excerpt: "New" },
      { title: "Mid Post", date: "2024-03-10", slug: "mid", excerpt: "Mid" },
    ] as BlogPost[];

    const result = readPosts(posts);
    expect(result.map(p => p.slug)).toEqual(["new", "mid", "old"]);
  });

  it("returns empty array when no posts exist", () => {
    const result = readPosts([]);
    expect(result).toEqual([]);
  });

  it("handles posts with identical dates", () => {
    const posts = [
      { title: "Same Day A", date: "2024-05-01", slug: "a", excerpt: "A" },
      { title: "Same Day B", date: "2024-05-01", slug: "b", excerpt: "B" },
    ] as BlogPost[];

    const result = readPosts(posts);
    expect(result.length).toBe(2);
    // Both should be present (order among same dates is unspecified)
    const slugs = result.map(p => p.slug);
    expect(slugs).toContain("a");
    expect(slugs).toContain("b");
  });

  it("returns BlogPost type with correct fields", () => {
    const posts = [
      { title: "Test Post", date: "2024-01-01", slug: "test", excerpt: "Test excerpt" },
    ] as BlogPost[];

    const result = readPosts(posts);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("date");
    expect(result[0]).toHaveProperty("slug");
    expect(result[0]).toHaveProperty("excerpt");
    expect(typeof result[0].title).toBe("string");
    expect(typeof result[0].date).toBe("string");
    expect(typeof result[0].slug).toBe("string");
    expect(typeof result[0].excerpt).toBe("string");
  });
});

describe("getPostBySlug", () => {
  it("finds a post by its slug", () => {
    const posts = [
      { title: "Post One", date: "2024-01-01", slug: "post-one", excerpt: "First" },
      { title: "Post Two", date: "2024-02-01", slug: "post-two", excerpt: "Second" },
    ] as BlogPost[];

    const result = getPostBySlug(posts, "post-two");
    expect(result).toEqual({
      title: "Post Two",
      date: "2024-02-01",
      slug: "post-two",
      excerpt: "Second",
    });
  });

  it("returns undefined for non-existent slug", () => {
    const posts = [
      { title: "Post One", date: "2024-01-01", slug: "post-one", excerpt: "First" },
    ] as BlogPost[];

    const result = getPostBySlug(posts, "nonexistent");
    expect(result).toBeUndefined();
  });

  it("handles slug with special characters", () => {
    const posts = [
      { title: "Post", date: "2024-01-01", slug: "post-with-dashes", excerpt: "Dashed" },
    ] as BlogPost[];

    const result = getPostBySlug(posts, "post-with-dashes");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("post-with-dashes");
  });
});
