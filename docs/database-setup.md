# SandraGPT database (optional)

The static site works everywhere via **localStorage**. To also persist questions and answers in **Postgres** (hosted on **Supabase**), deploy the repo to **Vercel** and attach serverless API routes in `/api`.

## 1. Create the table

In the Supabase dashboard → **SQL** → run the script in [`sql/schema.sql`](../sql/schema.sql).

## 2. Environment variables (Vercel)

In Vercel → your project → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Project URL (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Service role** key (server only; never put this in the browser or commit it) |

Redeploy after saving.

## 3. Why service role?

The API runs **only on the server**. The browser never sees the database key. Do **not** enable anonymous inserts from the client directly to Supabase without careful Row Level Security.

## 4. Local testing

```bash
cp .env.example .env.local
# fill SUPABASE_* then:
npx vercel dev
```

Open the local URL and use SandraGPT; check the `sandra_gpt_turns` table in Supabase.

## 5. GitHub Pages only

If you host **only** static files on GitHub Pages, `/api/sandra-gpt` will not exist. The UI falls back to localStorage and **503** responses are ignored.

## 6. API behavior

The serverless handler applies **rate limits** per client IP (roughly: GET and POST budgets per minute) and rejects malformed `session_id` / turn ids with **400**. **429** means slow down; the SandraGPT UI shows a warning and keeps answers in the browser.
