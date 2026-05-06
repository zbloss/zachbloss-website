"use client";

import { useState } from "react";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  message: string;
}

type SubmissionState = "idle" | "submitting" | "success" | "fallback";

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
      } else if (response.status === 422) {
        // Formspree rate limit / validation error
        setSubmissionState("fallback");
      } else {
        setSubmissionState("fallback");
      }
    } catch {
      // Network error
      setSubmissionState("fallback");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (submissionState === "success") {
    return (
      <div className="contact-output space-y-4" role="region" aria-label="Contact form">
        <div className="text-purple-400 font-bold text-lg">
          ┌ Contact ──────────────────────────────┐
        </div>
        <div className="pl-2 text-lime-400 font-bold">
          ✓ Thank you for your message! I&#39;ll get back to you soon.
        </div>
        <div className="text-gray-500 pl-2">
          └─────────────────────────────────────────┘
        </div>
      </div>
    );
  }

  if (submissionState === "fallback") {
    return (
      <div className="contact-output space-y-4" role="region" aria-label="Contact form">
        <div className="text-purple-400 font-bold text-lg">
          ┌ Contact ──────────────────────────────┐
        </div>
        <div className="pl-2 text-amber-400">
          Message delivery unavailable. Reach me directly:
        </div>
        <div className="pl-2 space-y-1">
          <Link
            href="https://github.com/zbloss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2 block"
          >
            ─ GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/zbloss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2 block"
          >
            ─ LinkedIn
          </Link>
        </div>
        <div className="text-gray-500 pl-2">
          └─────────────────────────────────────────┘
        </div>
      </div>
    );
  }

  return (
    <div className="contact-output space-y-4" role="region" aria-label="Contact form">
      <div className="text-purple-400 font-bold text-lg">
        ┌ Contact ──────────────────────────────┐
      </div>
      <div className="pl-2 text-gray-400 mb-2">
        Prefer to reach me directly?
      </div>
      <div className="pl-2 space-y-1 mb-3">
        <Link
          href="https://github.com/zbloss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2 block"
        >
          ─ GitHub
        </Link>
        <Link
          href="https://linkedin.com/in/zbloss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-2 block"
        >
          ─ LinkedIn
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="text-lime-400 font-bold block mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            className="w-full bg-gray-900 border border-purple-700 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-lime-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-lime-400 font-bold block mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            required
            className="w-full bg-gray-900 border border-purple-700 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-lime-500"
          />
        </div>
        <div>
          <label htmlFor="message" className="text-lime-400 font-bold block mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full bg-gray-900 border border-purple-700 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-lime-500"
          />
        </div>
        <button
          type="submit"
          disabled={submissionState === "submitting"}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submissionState === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </form>
      <div className="text-gray-500 pl-2">
        └─────────────────────────────────────────┘
      </div>
    </div>
  );
}
