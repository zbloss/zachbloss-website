# Context: zachbloss.com

Personal portfolio site for Zachary Bloss. Primary audience: developers and technical recruiters arriving via GitHub or LinkedIn.

## Glossary

### Boot Sequence
The auto-run welcome screen displayed on initial page load before any user interaction. Prints name, tagline, and a hint to run `/help`, then drops to a live prompt. Not interactive — purely presentational.

### Command
A `/prefixed` string typed into the Terminal Prompt that maps directly to a named route (e.g., `/projects` → `zachbloss.com/projects`). Known commands execute immediately without LM involvement. Unknown `/commands` fall back to Intent Resolution.

### Command Set
The full list of defined commands the site recognizes:
- `/help` — lists all commands with descriptions
- `/about` — background, skills (Generative AI, Data Science, Analytics)
- `/projects` — portfolio of 6 projects
- `/certifications` — professional certifications
- `/blog` — markdown-authored posts (shows "coming soon" until content exists)
- `/contact` — contact info + Formspree message form
- `/clear` — clears terminal output, returns to prompt
- `/latest` — 3 most recent git commits, formatted at build time

### Terminal Prompt
The text input at the bottom of every page where users type Commands or plain-text queries. On mobile, a row of tappable Command shortcuts appears above it.

### Intent Resolution
The process of mapping a plain-text user input (no `/` prefix) to the closest Command using embedding similarity search. Powered by `Xenova/all-MiniLM-L6-v2` via Transformers.js, running fully in-browser.

**Confidence thresholds:**
- ≥ 0.85 → auto-execute the matched Command
- 0.50–0.84 → suggest the Command and wait for confirmation
- < 0.50 → print "I'm not sure what you mean — try `/help`"

### Rich Terminal Component
A styled React component rendered in the Terminal Body as output for a Command. Uses the site's purple/lime palette, monospace font, and ASCII-style borders (`┌─┐`, `└─┘`) to maintain the TUI aesthetic while supporting images, links, and structured layout. Not plain text — not a full GUI — the hybrid between them.

### Terminal Body
The scrollable content area above the Terminal Prompt where Command output and Boot Sequence text appear. Each new Command appends its Rich Terminal Component output; `/clear` empties it.

### Command History
In-memory log of Commands typed in the current session. Navigable with ↑/↓ arrow keys. Not persisted across page loads.

### Assistant Status
A small status indicator in the terminal chrome showing the Transformers.js model loading state: `loading assistant...` → `assistant ready`. Model begins loading 3 seconds after page load via a low-priority background fetch.

### `/latest`
Command that displays the 3 most recent git commits, pulled and human-formatted at build time as static data. Reflects real site changes without manual maintenance.

### `/contact` Form
A Formspree-backed message form rendered by the `/contact` Command. Free tier supports 50 submissions/month. On Formspree's rate-limit error, the site displays a graceful fallback message directing the visitor to GitHub or LinkedIn instead.
