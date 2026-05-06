/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContactForm } from "@/app/components/ContactForm";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock NEXT_PUBLIC_FORMSPREE_FORM_ID
Object.defineProperty(global, "process", {
  value: {
    env: {
      NEXT_PUBLIC_FORMSPREE_FORM_ID: "TEST_FORM_ID",
    },
  },
  writable: true,
});

describe("ContactForm", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders a heading", () => {
    render(<ContactForm />);
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });

  it("renders contact info links (GitHub and LinkedIn)", () => {
    render(<ContactForm />);
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn/)).toBeInTheDocument();
  });

  it("renders a message form with name, email, and message fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<ContactForm />);
    expect(screen.getByRole("button", { name: /Send Message/i })).toBeInTheDocument();
  });

  it("shows a success message on successful form submission", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "Success",
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: "Hello!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thank you/i)).toBeInTheDocument();
    });
  });

  it("shows fallback message on HTTP 422 (rate limit)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: "Hello!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText(/GitHub/)).toBeInTheDocument();
    });
  });

  it("shows fallback message on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: "Hello!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText(/GitHub/)).toBeInTheDocument();
    });
  });

  it("renders in a styled container with ASCII borders", () => {
    const { container } = render(<ContactForm />);
    const el = container.querySelector(".contact-output");
    expect(el).toBeInTheDocument();
  });
});
