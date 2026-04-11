# Site map (for editors and agents)

This repo is a static personal site. There is no build step.

## Files to know

| Path | Role |
|------|------|
| `index.html` | Single page: copy, sections, meta/SEO, JSON-LD |
| `assets/styles.css` | Layout, typography, SandraGPT chrome |
| `assets/sandra-gpt.js` | Keyword-based replies (must stay in sync with on-page copy) |
| `assets/script.js` | Footer year |
| `assets/fonts/` | Geist (self-hosted, OFL) |
| `robots.txt` | Crawler hints |
| `sitemap.xml` | Canonical URL list for search engines |

## Edit workflows

- **Hero or section text:** `index.html` only; mirror important facts in `sandra-gpt.js` `KNOWLEDGE` if SandraGPT should answer them.
- **Visual polish:** `assets/styles.css`; bump `?v=` on CSS in `index.html` after substantive CSS changes.
- **SandraGPT behavior:** `assets/sandra-gpt.js`; bump `?v=` on that script in `index.html` when shipping.

## Conventions

- External links: `target="_blank"` with `rel="noopener noreferrer"`.
- Cache bust: query string on `/assets/styles.css` and `/assets/*.js`.
