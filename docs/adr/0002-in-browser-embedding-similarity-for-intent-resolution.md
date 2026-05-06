# ADR-0002: In-Browser Embedding Similarity for Intent Resolution

**Status:** Accepted

## Context

Users who type plain-text input (no `/` prefix) need their intent mapped to a Command. Options considered: a server-side LLM API call, a fine-tuned intent classifier, or in-browser embedding similarity search.

## Decision

Use `Xenova/all-MiniLM-L6-v2` via Transformers.js for embedding similarity search, running entirely in the browser. Each Command has a description; embeddings are pre-computed at load time. User input is embedded at query time and matched by cosine similarity against the Command embeddings.

Model loads via a low-priority background fetch starting 3 seconds after page load.

## Rationale

- Static export constraint: no server runtime, so server-side LLM is not viable without adding a serverless function
- No fine-tuning required: adding a new Command means adding a description, not retraining
- Zero marginal cost: no API calls, no rate limits, works offline
- ~23MB model download is front-loaded and cached by the browser after first visit

## Trade-offs

- 23MB download on first visit (paid once; cached thereafter)
- 1–3 second model initialization delay on slow connections (mitigated by 3-second preload and `loading assistant...` status indicator)
- Similarity search is less accurate than a purpose-built classifier for an extremely large Command Set, but the Command Set is small and stable
