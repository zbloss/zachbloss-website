# Coding Standards

## Style

- TypeScript strict mode — no `any` types; no `@ts-ignore` without a comment explaining why
- Use camelCase for variables and functions; PascalCase for components, types, and interfaces
- Prefer named exports over default exports in non-page files
- No Framer Motion — CSS transitions only for all animations (boot sequence text reveal, output fade-in)
- Tailwind classes for layout; inline CSS variables for the purple/lime palette brand colors
- ASCII box-drawing characters (`┌─┐ └─┘ │`) for terminal card borders — not HTML borders
- Monospace font enforced via Tailwind class at the TerminalLayout level, not per-component

## Architecture

- All routes render inside `TerminalLayout` as a common shell — do not duplicate chrome in individual route components
- Client components (`'use client'`) only when the component uses browser APIs, state, or event handlers; default to Server Components
- Static export maintained (`output: 'export'` in next.config.js) — no server-side APIs, no `getServerSideProps`, no route handlers
- `BlogPostLoader` and `LatestCommitsLoader` run at build time only; never import them into client components
- `IntentResolver` is a client-side module wrapping Transformers.js — load it lazily, 3 seconds after page load, via a low-priority fetch
- `CommandRouter` receives raw input from `TerminalPrompt` and owns all routing logic — individual route components do not navigate

## Testing

- Tests verify observable behavior from the outside — what a user or caller sees — not internal state, class names, or private methods
- Do not assert on Tailwind class names or DOM structure; assert on rendered text and user-visible outcomes
- Every public function in `IntentResolver`, `CommandRouter`, `BlogPostLoader`, and `LatestCommitsLoader` must have tests before the implementation is considered complete
- Use `@testing-library/react` for component tests; plain vitest for pure-function unit tests
- Test file lives next to the file it tests: `foo.ts` → `foo.test.ts`
- Test names describe expected behavior in plain English: `"returns null when input confidence is below 0.50"`

## Security

- Contact form submits to Formspree via `fetch` — never log or expose the form ID in client-side error messages
- No credentials, API keys, or tokens in source files — use environment variables prefixed with `NEXT_PUBLIC_` only for values safe to expose to the browser
