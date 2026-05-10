# Security Review: Secrets Audit (Issue #11)

**Date:** 2026-05-06  
**Reviewer:** RALPH (AI Agent)  
**Trigger:** Repository planned to become public for demonstration purposes

## Executive Summary

**No secrets found.** The repository is clean of hardcoded secrets, API keys, passwords, tokens, or any other sensitive credential values — both in the current state and in the full git history.

## Scope of Review

### 1. Current Source Code

Scanned all source files for common secret patterns:

| Category | Pattern Searched | Result |
|---|---|---|
| AWS Access Keys | `AKIA[A-Z0-9]{16}` | Not found |
| AWS Secret Keys | Common partial matches | Not found |
| GitHub Tokens | `ghp_[A-Za-z0-9]{36}` | Not found |
| Stripe/Platform API keys | Various common prefixes | Not found |
| Passwords | `password\s*[:=]\s*['"][^'"]{3,}` | Not found |
| Private keys | `BEGIN.*PRIVATE KEY` | Not found |
| Database connection strings | `mongodb://`, `postgres://`, `mysql://`, `redis://` | Not found |
| Bearer tokens | `Bearer [A-Za-z0-9]+\.[A-Za-z0-9]+` | Not found |
| JWT-like tokens | Base64-encoded JWTs | Not found |
| Generic API keys | `api_key`, `apiKey` with non-placeholder values | Not found |

**Files examined:**
- `app/` — all `.ts`, `.tsx`, `.js` files
- `lib/` — all source files
- `hooks/` — all source files
- `__mocks__/` — all mock files
- `public/` — all asset and config files
- `patches/` — all patch files
- Root-level config files: `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`, `vitest.config.ts`, `vitest.setup.ts`, `jest.config.js`, `.cursorrules`

**Non-source config files examined:**
- `docs/` — all documentation files
- `website-prd.md`, `CONTEXT.md`, `README.md`
- `.sandcastle/` — all Sandcastle tooling files

### 2. Git History

Scanned the full git history across all branches for secrets that may have been committed and later removed:

| Check | Result |
|---|---|
| `git log -p -S` for secret patterns | No matches |
| All `.env` files ever committed or deleted | None found |
| Deleted blobs containing credentials | None found |
| Diffs adding sensitive keywords | No matches |

**Branches scanned:** All local and remote branches (main, tui-refactor, sandcastle/* feature branches)

### 3. Environment Configuration

| File | Status |
|---|---|
| `.env`, `.env.local`, `.env.production`, `.env.development` | **Not present** — correctly gitignored |
| `.sandcastle/.env.example` | Contains placeholder keys (`ANTHROPIC_API_KEY=`, `GH_TOKEN=`) — empty values, no secrets |
| `.sandcastle/pi-models.json`, `pi-models-proxy.json` | `apiKey: "not-needed"` — placeholder string, not a real key |

### 4. CI/CD Workflows

| File | Secrets Usage | Verdict |
|---|---|---|
| `.github/workflows/build_and_deploy.yaml` | `${{ secrets.AWS_ACCESS_KEY_ID }}`, `${{ secrets.AWS_SECRET_ACCESS_KEY }}`, `${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}`, `${{ secrets.NEXT_PUBLIC_GA_MEASUREMENT_ID }}` | ✅ Correct — uses GitHub Secrets syntax |
| `.github/workflows/build_test.yaml` | `${{ secrets.NEXT_PUBLIC_GA_MEASUREMENT_ID }}` | ✅ Correct — uses GitHub Secrets syntax |

All secrets in workflows reference GitHub repository secrets via `${{ secrets.* }}` syntax. No hardcoded values.

### 5. Source Code Environment Variable Usage

| Variable | Usage | Verdict |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""` in `app/layout.tsx` | ✅ Safe — public GA ID with empty fallback; value injected at build time via CI |

**Note:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is intentionally public (prefixed `NEXT_PUBLIC_`) as it's a Google Analytics tracking ID, not a secret. It is injected at build time by the CI/CD workflow.

## Findings

### No secrets found. The repository is safe to make public.

### Minor Observations (Not Security Issues)

1. **`.sandcastle/.env.example`** contains variable names (`ANTHROPIC_API_KEY`, `GH_TOKEN`) that hint at secrets used externally. These are reference-only and do not contain any actual values. This is fine.

2. **`.sandcastle/pi-models.json`** and **`.sandcastle/pi-models-proxy.json`** reference `host.docker.internal` URLs with `apiKey: "not-needed"`. These are development configuration for the AI agent tooling and contain no real secrets.

3. **CI/CD workflows reference CloudFront distribution ID** via `${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}`. CloudFront distribution IDs are semi-public identifiers (they follow the pattern `E1234567890ABC`), but storing them in GitHub Secrets is still best practice and does not expose sensitive access.

## Recommendations

1. **Consider adding `/.env` to `.gitignore`** — it is already there (line 27), but the `.sandcastle/.gitignore` does not include `.env`. For defense in depth, you could add `.env` to `.sandcastle/.gitignore` as well.

2. **Rotate any secrets used in CI/CD** (AWS keys, CloudFront ID, GA measurement ID) as a proactive measure before making the repo public. This is a precautionary best practice, not a response to a finding.

3. **Consider adding a `.gitignore` rule for `.sandcastle/.env`** — the `.sandcastle/.gitignore` already includes `.env`, so this is covered.

4. **Consider adding a pre-commit hook or GitHub Action** that scans for secrets (e.g., using `gitleaks` or `trufflehog`) to prevent accidental future commits.

## Conclusion

The repository contains **zero secrets** in the current source code or in any previous commit. All credential management follows best practices:
- Secrets stored in GitHub Repository Secrets
- Environment variables injected at build time
- No hardcoded credentials
- `.env` files properly gitignored
- Placeholder values are clearly identifiable (`"not-needed"`, empty strings)

The repository is **safe to make public** with no risk of credential exposure.
