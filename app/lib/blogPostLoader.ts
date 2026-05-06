import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  body?: string;
}

/**
 * Parse frontmatter from a markdown string using gray-matter.
 * Returns a BlogPost with extracted fields.
 */
export function parseFrontmatter(md: string): BlogPost {
  try {
    const { data, content } = matter(md);
    const rawDate = data.date;
    const dateStr =
      rawDate instanceof Date
        ? rawDate.toISOString().split("T")[0]
        : String(rawDate ?? "");
    return {
      title: String(data.title ?? ""),
      date: dateStr,
      slug: String(data.slug ?? ""),
      excerpt: String(data.excerpt ?? ""),
      body: content,
    };
  } catch {
    // Malformed frontmatter — return empty fields, keep raw content as body
    return {
      title: "",
      date: "",
      slug: "",
      excerpt: "",
      body: md,
    };
  }
}

/**
 * Sort posts by date descending (newest first).
 * Called by `loadBlogPosts` after reading all markdown files.
 */
export function readPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Find a single post by its slug.
 * Returns undefined if no matching post is found.
 */
export function getPostBySlug(
  posts: BlogPost[],
  slug: string,
): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Read all markdown files from the posts/ directory and parse them.
 * Called at build time (static export).
 */
export function loadBlogPosts(): BlogPost[] {
  const postsDir = path.join(process.cwd(), "posts");
  const posts: BlogPost[] = [];

  if (!fs.existsSync(postsDir)) {
    return posts;
  }

  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const post = parseFrontmatter(content);

    // Only include posts that have a valid slug
    if (post.slug) {
      posts.push(post);
    }
  }

  return readPosts(posts);
}
