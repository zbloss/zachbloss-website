"use client";

import { useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Shared pieces — reduce repetition across render paths
// ---------------------------------------------------------------------------

const BOX_HEADER = "┌ Contact ──────────────────────────────┐";
const BOX_FOOTER = "└─────────────────────────────────────────┘";
const BOX_CLASS = "text-purple-400 font-bold text-lg truncate";
const FOOTER_CLASS = "text-gray-500 pl-2 truncate";
const LINK_CLASS =
  "text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2 block";

function ContactLinks() {
  return (
    <div className="pl-2 space-y-1">
      <Link
        href="https://github.com/zbloss"
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        ─ GitHub
      </Link>
      <Link
        href="https://linkedin.com/in/zbloss"
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        ─ LinkedIn
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  email: string;
  message: string;
}

type SubmissionState = "idle" | "submitting" | "success" | "fallback";

const SUCCESS_MESSAGE =
  "✓ Thank you for your message! I'll get back to you soon.";

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionState("submitting");

    const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSubmissionState("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setSubmissionState("fallback");
      }
    } catch {
      setSubmissionState("fallback");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Success — single message, no form
  if (submissionState === "success") {
    return (
      <BoxContainer>
        <div className="pl-2 text-lime-400 font-bold">{SUCCESS_MESSAGE}</div>
      </BoxContainer>
    );
  }

  // Fallback — direct links when form delivery fails
  if (submissionState === "fallback") {
    return (
      <BoxContainer>
        <div className="pl-2 text-amber-400">
          Message delivery unavailable. Reach me directly:
        </div>
        <ContactLinks />
      </BoxContainer>
    );
  }

  // Default — full form with direct links above it
  return (
    <BoxContainer>
      <div className="pl-2 text-gray-400 mb-2">
        Prefer to reach me directly?
      </div>
      <ContactLinks />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Name" id="name">
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            className={inputClasses}
          />
        </Field>
        <Field label="Email" id="email">
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            required
            className={inputClasses}
          />
        </Field>
        <Field label="Message" id="message">
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleInputChange}
            required
            rows={4}
            className={inputClasses}
          />
        </Field>
        <button
          type="submit"
          disabled={submissionState === "submitting"}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submissionState === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </BoxContainer>
  );
}

// ---------------------------------------------------------------------------
// Inline helpers — keep JSX tree flat and readable
// ---------------------------------------------------------------------------

function BoxContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="contact-output space-y-4 overflow-hidden" role="region" aria-label="Contact form">
      <div className={BOX_CLASS}>{BOX_HEADER}</div>
      {children}
      <div className={FOOTER_CLASS}>{BOX_FOOTER}</div>
    </div>
  );
}

const inputClasses =
  "w-full bg-gray-900 border border-purple-700 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-lime-500";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-lime-400 font-bold block mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
