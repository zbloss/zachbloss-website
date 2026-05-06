# PRD: TUI Refactor — Redesign zachbloss.com as a Terminal User Interface

## Problem Statement

The current site relies on heavy animations (Framer Motion, full-viewport video background) and a traditional scrolling layout that feels dated. There is no interactive way for visitors to navigate content — everything is on one long page with hash-based anchor links. The aesthetic no longer reflects the owner's current sensibility, and the site doesn't stand out as a developer portfolio.

## Solution

Refactor the site into a terminal user interface (TUI) themed experience — visually styled like a TUI app (monospace font, ASCII borders, purple/lime palette) with a real command prompt visitors can type into. Each command maps to a real URL route. An in-browser language model handles plain-text input from visitors who don't know the exact commands, classifying their intent via embedding similarity search and routing them to the best match. Heavy animations are removed entirely.

## User Stories

1. As a visitor, I want to see a welcoming boot sequence when I land on the site, so that I immediately understand the terminal interface and know how to get started.
2. As a visitor, I want to be shown a hint to run `/help` on page load, so that I can discover available commands without guessing.
3. As a visitor, I want to type `/help` and see a list of all available commands with descriptions, so that I can navigate the site without prior knowledge.
4. As a visitor, I want to type `/projects` and see Zachary's portfolio projects, so that I can evaluate his work.
5. As a visitor, I want to type `/about` and read about Zachary's background and skills, so that I can understand his expertise.
6. As a visitor, I want to type `/certifications` and see his professional certifications, so that I can assess his credentials.
7. As a visitor, I want to type `/blog` and see a list of blog posts, so that I can read his writing.
8. As a visitor, I want to type `/contact` and see his contact information plus a message form, so that I can reach out to him.
9. As a visitor, I want to type `/latest` and see the 3 most recent changes to the site, so that I can see what's new.
10. As a visitor, I want to type `/clear` and have the terminal output cleared, so that I can start fresh.
11. As a visitor, I want to use the ↑ and ↓ arrow keys to navigate my command history, so that I can re-run previous commands without retyping.
12. As a visitor, I want to type plain English like "show me your work" and have the site figure out I mean `/projects`, so that I don't need to know exact command syntax.
13. As a visitor whose plain-text input clearly matches a command, I want the site to run that command automatically, so that the experience feels intelligent and frictionless.
14. As a visitor whose plain-text input is ambiguous, I want the site to suggest the best-match command and ask me to confirm, so that I stay in control.
15. As a visitor whose input doesn't match anything, I want a helpful message directing me to `/help`, so that I'm not left with a dead end.
16. As a visitor on mobile, I want tappable shortcut buttons above the input for all commands, so that I can navigate without typing.
17. As a visitor on mobile, I still want the terminal prompt available, so that I can type commands if I prefer.
18. As a visitor, I want to submit a contact message via a form on `/contact`, so that I can reach Zachary without opening my email client.
19. As a visitor, I want to see a clear error message if the contact form is unavailable due to submission limits, with alternative contact options, so that I am not left without a way to reach out.
20. As a visitor, I want each command to have its own shareable URL (e.g. `zachbloss.com/projects`), so that I can link someone directly to a specific section.
21. As a visitor using the browser back button after running a command, I want to go back to the previous command's page, so that navigation feels natural.
22. As a developer visiting the site, I want to see rich terminal-styled cards with project images and links, so that I get a visually compelling view of Zachary's work.
23. As a visitor, I want to see a status indicator (`loading assistant...` / `assistant ready`) so that I know when the intent resolver is available.
24. As a returning visitor, I want the in-browser model to be cached by my browser, so that subsequent visits do not re-download 23MB.
25. As a visitor reading Zachary's blog, I want individual posts to be accessible at their own URLs, so that I can share a specific post.
26. As a visitor landing on `/blog` before any posts are published, I want to see a "coming soon" message rather than an empty or broken page.

## Implementation Decisions

### Modules

**TerminalLayout** (shared across all routes)
- Renders the terminal chrome: Boot Sequence on initial load, Terminal Body (scrollable output), Terminal Prompt (text input), Assistant Status indicator
- Manages Command History in memory (↑/↓ navigation), not persisted across page loads
- On mobile: renders MobileCommandShortcuts row above the Terminal Prompt

**CommandRouter**
- Receives raw input from the Terminal Prompt
- If input starts with `/` and matches a known command: navigate to that route
- If input starts with `/` and is unknown: delegate to IntentResolver
- If input has no `/` prefix: delegate to IntentResolver
- Applies IntentResolver confidence thresholds: ≥0.85 auto-navigate, 0.50–0.84 print suggestion and await Enter confirmation, <0.50 print "try /help"

**IntentResolver**
- Wraps `Xenova/all-MiniLM-L6-v2` via Transformers.js
- Loads model via low-priority background fetch starting 3 seconds after page load
- Pre-computes embeddings for all Command descriptions at init time
- At query time: embeds user input, runs cosine similarity against Command embeddings, returns best match with score
- Interface: `resolve(input: string) => Promise<{ command: string; confidence: number } | null>`

**BootSequence**
- Purely presentational, renders on first load only
- Prints: site name, tagline, 1–2 lines, then `hint: run /help to see all available commands`

**RichTerminalComponents** (one per command)
- `HelpOutput` — table of commands and descriptions
- `AboutOutput` — skills section (Generative AI, Data Science, Analytics)
- `ProjectCard` — project title, description, image, link; ASCII border
- `CertCard` — cert title, description, image, link; ASCII border
- `BlogPostList` — list of post titles, dates, excerpts with links
- `BlogPostView` — rendered markdown post body
- `ContactForm` — contact info links + Formspree form with error handling
- `LatestCommitsOutput` — 3 commit entries with date and message
- `MobileCommandShortcuts` — row of tappable buttons for all commands

**ContactForm**
- Submits to Formspree (free tier, 50 submissions/month)
- On HTTP 422 (rate limit) or network error: display graceful fallback directing visitor to GitHub and LinkedIn
- Uses standard fetch POST with JSON body

**BlogPostLoader** (build-time)
- Reads `posts/*.md` at Next.js build time
- Parses frontmatter (title, date, slug, excerpt) and markdown body
- Returns typed `Post[]` used by `/blog` and `/blog/[slug]` routes

**LatestCommitsLoader** (build-time)
- Runs `git log` at Next.js build time
- Formats 3 most recent commits: human-readable date + message
- Exports as static data consumed by `/latest` route

### Architecture

- Framework: Next.js 14 with App Router, static export (`output: 'export'`) maintained
- All routes share TerminalLayout as a common shell
- Framer Motion removed entirely; CSS transitions used for boot sequence text reveal and output fade-in
- Color palette: purple/lime brand colors in terminal frame (monospace font, ASCII-style borders `┌─┐ └─┘`)
- Transformers.js WASM files served as static assets

### Routing

| Command | Route |
|---|---|
| `/help` | `/help` |
| `/about` | `/about` |
| `/projects` | `/projects` |
| `/certifications` | `/certifications` |
| `/blog` | `/blog` |
| `/blog [slug]` | `/blog/[slug]` |
| `/contact` | `/contact` |
| `/latest` | `/latest` |
| `/clear` | clears Terminal Body, stays on current route |

## Testing Decisions

A good test verifies observable behavior from the outside — what a user or caller sees — not internal implementation details. Tests should not assert on class names, internal state, or private methods.

**IntentResolver** — unit tests covering:
- High-confidence input correctly returns the expected command above 0.85 threshold
- Low-confidence input returns null or a below-threshold result
- Model initialization completes and embeddings are available before `resolve()` is called
- Edge cases: empty string, single character, input that is itself a valid command

**CommandRouter** — unit tests covering:
- Known `/command` input triggers correct route navigation
- Unknown `/command` delegates to IntentResolver
- Plain-text input (no `/` prefix) always delegates to IntentResolver
- High-confidence result triggers navigation
- Mid-confidence result prints suggestion without navigating
- Low-confidence result prints "try /help"

**BlogPostLoader** — unit tests covering:
- Reads and parses a valid markdown file with frontmatter correctly
- Returns posts sorted by date descending
- Handles an empty `posts/` directory (returns empty array, no crash)
- Handles malformed frontmatter gracefully

**LatestCommitsLoader** — unit tests covering:
- Parses `git log` output into correctly structured commit objects
- Returns exactly 3 entries even when more commits exist
- Handles repos with fewer than 3 commits

## Out of Scope

- Server-side rendering or serverless functions — static export is maintained throughout
- Authentication or user accounts
- Comments on blog posts
- Search within blog post content
- Analytics changes (existing Google Analytics integration is preserved)
- CMS integration — blog posts are markdown files in the repo only
- Dark/light mode toggling — site remains forced dark
- Fine-tuning or training a custom intent classifier

## Further Notes

- A Formspree account and form ID are required before `/contact` can be wired up. Store the form ID as an environment variable.
- The `Xenova/all-MiniLM-L6-v2` model (~23MB) is cached by the browser after first download. Subsequent visits pay no download cost.
- A `posts/` directory should be created at the repo root with a `.gitkeep` so the directory exists before any posts are written.
- `CONTEXT.md` (domain glossary) and `docs/adr/` (three ADRs: real URL routes, in-browser embedding similarity, static export) have already been written to the repo.
