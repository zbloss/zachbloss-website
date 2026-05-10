import Link from "next/link";

export interface BlogPostSummary {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
}

interface BlogPostListProps {
  posts: BlogPostSummary[];
}

export function BlogPostList({ posts }: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="blog-output space-y-2 overflow-hidden" role="region" aria-label="Blog">
        <div className="text-purple-400 font-bold text-lg truncate">
          ┌ Blog Posts ──────────────────────────────┐
        </div>
        <div className="pl-2 text-gray-400 italic">
          Coming soon...
        </div>
        <div className="text-gray-500 pl-2 truncate">
          └───────────────────────────────────────────┘
        </div>
      </div>
    );
  }

  return (
    <div className="blog-output space-y-2 overflow-hidden" role="region" aria-label="Blog Posts">
      <div className="text-purple-400 font-bold text-lg truncate">
        ┌ Blog Posts ──────────────────────────────┐
      </div>
      <div className="pl-2 space-y-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border-2 border-purple-600 bg-purple-950/30 p-3"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2"
            >
              ─ {post.title}
            </Link>
            <div className="text-gray-500 text-sm mt-1">{post.date}</div>
            <p className="text-gray-300 text-sm mt-1 leading-relaxed break-words">
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
      <div className="text-gray-500 pl-2 truncate">
        └───────────────────────────────────────────┘
      </div>
    </div>
  );
}
