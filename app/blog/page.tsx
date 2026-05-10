import { TerminalLayout } from "@/app/components/TerminalLayout";
import { BlogPostList } from "@/app/components/BlogPostList";
import { loadBlogPosts } from "@/app/lib/blogPostLoader";

export default function BlogPage() {
  const posts = loadBlogPosts();

  return (
    <TerminalLayout>
      <BlogPostList posts={posts} />
    </TerminalLayout>
  );
}
