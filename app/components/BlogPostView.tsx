import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface BlogPostFull {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  body?: string;
}

interface BlogPostViewProps {
  post: BlogPostFull;
}

export function BlogPostView({ post }: BlogPostViewProps) {
  return (
    <div className="blog-post-output space-y-2" role="region" aria-label={post.title}>
      <div className="text-purple-400 font-bold text-lg">
        ┌ {post.title} ─────────────────────────────┐
      </div>
      <div className="pl-2">
        <div className="text-gray-500 text-sm mb-3">Published: {post.date}</div>
        {post.body ? (
          <div className="prose prose-invert prose-purple max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-400 italic">No content yet.</div>
        )}
        <div className="mt-4">
          <Link
            href="/blog"
            className="text-lime-400 hover:text-lime-300 underline underline-offset-2"
          >
            ← Blog Posts
          </Link>
        </div>
      </div>
      <div className="text-gray-500 pl-2">
        └───────────────────────────────────────────┘
      </div>
    </div>
  );
}
