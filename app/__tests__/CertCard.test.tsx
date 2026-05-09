/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CertCard } from "@/app/components/CertCard";

const mockCert = {
  title: "Test Certification",
  description: "A test certification description.",
  imageUrl: "/images/cert.png",
  link: "https://example.com/cert",
};

describe("CertCard", () => {
  it("renders the certification title", () => {
    render(<CertCard certification={mockCert} />);
    expect(screen.getByText(/Test Certification/)).toBeInTheDocument();
  });

  it("renders the certification description", () => {
    render(<CertCard certification={mockCert} />);
    expect(screen.getByText(/A test certification description/)).toBeInTheDocument();
  });

  it("renders a link to the certification", () => {
    render(<CertCard certification={mockCert} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/cert");
  });

  it("renders with ASCII-style borders", () => {
    const { container } = render(<CertCard certification={mockCert} />);
    const el = container.querySelector(".cert-card");
    expect(el).toBeInTheDocument();
  });
});
