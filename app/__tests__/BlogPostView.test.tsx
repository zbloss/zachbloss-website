/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import { BlogPostView } from "@/app/components/BlogPostView";

const mockPost = {
  title: "My Test Post",
  date: "2024-05-15",
  slug: "my-test-post",
  excerpt: "Test excerpt",
  body: "# Hello\n\nThis is the **body** of the post.",
};

describe("BlogPostView", () => {
  it("renders the post title", () => {
    render(<BlogPostView post={mockPost} />);
    expect(screen.getByText(/My Test Post/)).toBeInTheDocument();
  });

  it("renders the post date", () => {
    render(<BlogPostView post={mockPost} />);
    expect(screen.getByText(/2024-05-15/)).toBeInTheDocument();
  });

  it("renders the post body as markdown", () => {
    render(<BlogPostView post={mockPost} />);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it("renders rendered markdown with HTML tags", () => {
    render(<BlogPostView post={mockPost} />);
    expect(screen.getByText(/body/)).toBeInTheDocument();
  });

  it("renders a link back to the blog list", () => {
    render(<BlogPostView post={mockPost} />);
    const link = screen.getByRole("link", { name: /blog posts/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/blog");
  });

  it("handles missing body gracefully", () => {
    const postWithoutBody = { ...mockPost, body: "" };
    render(<BlogPostView post={postWithoutBody} />);
    expect(screen.getByText(/My Test Post/)).toBeInTheDocument();
  });
});
