# Personal-Website
For myself.

I've been in private schools my whole life. Now I want to share my ~$600,000 education (what I've learned and how I've learned) for free.

Static site: open `index.html` or serve the repo root. For where to edit copy vs styles vs SandraGPT, see [`docs/exploration.md`](docs/exploration.md).

Optional **database** for SandraGPT (Supabase + Vercel API): [`docs/database-setup.md`](docs/database-setup.md).

`404.html` matches the site style for hosts that serve it for unknown paths (e.g. GitHub Pages).

Run **`npm run verify`** locally to match CI (JSON-LD + JS syntax + metadata file checks for robots/sitemap/security.txt). **`vercel.json`** adds security headers when you deploy on Vercel.

**`.well-known/security.txt`** lists a contact for responsible disclosure (see [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html)).