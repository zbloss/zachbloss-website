/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import { BlogPostList } from "@/app/components/BlogPostList";

const mockPosts = [
  { title: "First Post", date: "2024-06-15", slug: "first-post", excerpt: "First post excerpt" },
  { title: "Second Post", date: "2024-03-10", slug: "second-post", excerpt: "Second post excerpt" },
];

describe("BlogPostList", () => {
  it("renders the list header", () => {
    render(<BlogPostList posts={mockPosts} />);
    expect(screen.getByText(/Blog Posts/)).toBeInTheDocument();
  });

  it("renders all post titles", () => {
    render(<BlogPostList posts={mockPosts} />);
    expect(screen.getByText(/First Post/)).toBeInTheDocument();
    expect(screen.getByText(/Second Post/)).toBeInTheDocument();
  });

  it("renders post dates", () => {
    render(<BlogPostList posts={mockPosts} />);
    expect(screen.getByText(/2024-06-15/)).toBeInTheDocument();
    expect(screen.getByText(/2024-03-10/)).toBeInTheDocument();
  });

  it("renders post excerpts", () => {
    render(<BlogPostList posts={mockPosts} />);
    expect(screen.getByText(/First post excerpt/)).toBeInTheDocument();
    expect(screen.getByText(/Second post excerpt/)).toBeInTheDocument();
  });

  it("renders links to individual posts", () => {
    render(<BlogPostList posts={mockPosts} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/blog/first-post");
    expect(hrefs).toContain("/blog/second-post");
  });

  it("shows 'coming soon' when no posts exist", () => {
    render(<BlogPostList posts={[]} />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("renders ASCII-style border decorations", () => {
    const { container } = render(<BlogPostList posts={mockPosts} />);
    expect(container.querySelector(".blog-output")).toBeInTheDocument();
  });
});
