# Site map (for editors and agents)

This repo is a static personal site. There is no build step.

## Files to know

| Path | Role |
|------|------|
| `index.html` | Single page: copy, sections, meta/SEO, JSON-LD |
| `assets/styles.css` | Layout, typography, SandraGPT chrome |
| `assets/sandra-gpt.js` | Keyword-based replies (must stay in sync with on-page copy) |
| `assets/script.js` | Footer year; adds `class="js"` on `<html>` for styling hooks |
| `assets/fonts/` | Geist (self-hosted, OFL) |
| `robots.txt` | Crawler hints |
| `sitemap.xml` | Canonical URL list for search engines |
| `404.html` | Branded not-found page (many static hosts use it automatically) |
| `scripts/validate-jsonld.cjs` | Parses the first `application/ld+json` block in `index.html` |
| `scripts/verify-all.cjs` | **`npm run verify`** — JSON-LD + `node --check` on all JS |
| `vercel.json` | Optional **security headers** on Vercel (frame, nosniff, referrer, permissions-policy) |

## Quality checks

- **CI** (`.github/workflows/ci.yml`): required files exist, then **`npm run verify`** (JSON-LD + JS syntax).
- **SandraGPT** is deterministic keyword scoring over `KNOWLEDGE`; greetings and short thanks are handled before matching.
- **Question history** (left rail): cached in `localStorage` (`sandra-gpt-history-v1`; cap 80). Optional **Postgres** via Vercel `/api/sandra-gpt` + Supabase (see [`docs/database-setup.md`](database-setup.md)). **Clear** removes browser data and server rows for the current `sandra-gpt-session` when the API is live.
- **Sync status** line under “History”: shows whether the database API responded (`Database sync on`), static/offline (`Browser only`), or a warning (`Couldn’t sync` / `Server busy`) when the API exists but a write failed. After local-only history, the client **backfills** missing turns to the server when the API is available. **POST** retries once on failure.
- **API** (`api/sandra-gpt.js`): per-IP **rate limits** (GET/POST), validates `session_id` / turn `id` shape; **429** returns `Retry-After`. Sidebar history buttons use **`aria-current`** for the active item.
- **Reconnect**: `window` **`online`** event (debounced) re-runs backfill sync; **`Escape`** blurs the question field when focused. Each chat **turn** `<section>` has **`aria-label="Question and reply"`**.

## Edit workflows

- **Hero or section text:** `index.html` only; mirror important facts in `sandra-gpt.js` `KNOWLEDGE` if SandraGPT should answer them.
- **Visual polish:** `assets/styles.css`; bump `?v=` on CSS in `index.html` after substantive CSS changes.
- **SandraGPT behavior:** `assets/sandra-gpt.js`; bump `?v=` on that script in `index.html` when shipping.

## Conventions

- External links: `target="_blank"` with `rel="noopener noreferrer"`.
- Cache bust: query string on `/assets/styles.css` and `/assets/*.js`.
