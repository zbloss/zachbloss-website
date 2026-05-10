import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

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

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-purple-400 font-bold text-2xl mt-6 mb-3 border-b border-gray-700 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-purple-300 font-bold text-xl mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-purple-200 font-semibold text-lg mt-4 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-purple-200 font-semibold mt-3 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-lime-400 hover:text-lime-300 underline underline-offset-2"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-bold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
  pre: ({ children }) => (
    <pre className="bg-gray-900 border border-gray-700 rounded my-4 p-4 overflow-x-auto font-mono text-sm leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = !!className?.startsWith("language-");
    return isBlock ? (
      <code className="text-green-400">{children}</code>
    ) : (
      <code className="text-lime-300 bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-purple-500 pl-4 my-4 text-gray-400 italic">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-3 pl-0 list-none space-y-1 text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 pl-0 list-decimal list-inside space-y-1 text-gray-300 marker:text-lime-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 items-start">
      <span className="text-lime-400 shrink-0 font-mono select-none">-</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  hr: () => <hr className="border-gray-700 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm text-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-700 px-3 py-1 text-left text-purple-300 font-semibold bg-gray-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-700 px-3 py-1">{children}</td>
  ),
};

export function BlogPostView({ post }: BlogPostViewProps) {
  return (
    <div className="blog-post-output space-y-2 overflow-hidden" role="region" aria-label={post.title}>
      <div className="text-purple-400 font-bold text-lg truncate">
        ┌ {post.title} ─────────────────────────────┐
      </div>
      <div className="pl-2">
        <div className="text-gray-500 text-sm mb-3">Published: {post.date}</div>
        {post.body ? (
          <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
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
      <div className="text-gray-500 pl-2 truncate">
        └───────────────────────────────────────────┘
      </div>
    </div>
  );
}
