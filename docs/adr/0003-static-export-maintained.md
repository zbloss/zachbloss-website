# ADR-0003: Static Export Maintained

**Status:** Accepted

## Context

The site currently uses Next.js static export (`output: 'export'`), meaning no server runtime — just HTML/CSS/JS files served from a CDN. The TUI refactor adds an in-browser LM and a Formspree-backed contact form. Both were evaluated for server compatibility requirements.

## Decision

Maintain static export. All new features are constrained to work without a server:
- Intent Resolution runs in-browser via Transformers.js (WASM)
- `/contact` form submits to Formspree (third-party service)
- `/latest` git commits are formatted at build time as static data

## Rationale

- Zero hosting cost and operational overhead
- Existing GitHub Actions deployment pipeline requires no changes
- All planned features are achievable without a server

## Trade-offs

- Formspree free tier caps at 50 contact form submissions/month; handled with a graceful fallback message
- Any future feature requiring server-side logic (auth, dynamic data, webhooks) will need to either add a serverless function layer or reconsider this decision
