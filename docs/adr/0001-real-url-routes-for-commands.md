# ADR-0001: Real URL Routes for Commands

**Status:** Accepted

## Context

The site uses a terminal command metaphor. Commands like `/projects` and `/blog` need to map to content. Two architectures were considered: a single-page app where all commands render at `zachbloss.com` (URL never changes), or real Next.js routes where each command maps to a distinct URL (`zachbloss.com/projects`, `zachbloss.com/blog`).

## Decision

Use real Next.js pages for each Command. The terminal is a shared layout; each route renders its Rich Terminal Component output in the Terminal Body.

## Rationale

- Shareable URLs: visitors can link directly to `zachbloss.com/projects`
- Browser back/forward works naturally with command history
- SEO: each command's content is indexable as its own page
- Fits the existing static export setup with no architectural change

## Trade-offs

- Slightly more boilerplate than a single-page approach
- Page navigations cause a full route transition rather than instant in-terminal rendering (mitigated by Next.js prefetching)
