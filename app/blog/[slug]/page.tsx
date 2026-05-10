import { TerminalLayout } from "@/app/components/TerminalLayout";
import { BlogPostView } from "@/app/components/BlogPostView";
import { loadBlogPosts, getPostBySlug } from "@/app/lib/blogPostLoader";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = loadBlogPosts();
  if (posts.length === 0) {
    // Return a placeholder so Next.js recognizes generateStaticParams exists.
    // The page will show 404 since no post matches this slug.
    return [{ slug: "__placeholder__" }];
  }
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(loadBlogPosts(), params.slug);
  if (!post) notFound();

  return (
    <TerminalLayout>
      <BlogPostView post={post} />
    </TerminalLayout>
  );
}
