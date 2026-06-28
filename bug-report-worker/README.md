# Bug-report proxy (Cloudflare Worker)

Backs the **Report a bug** form on https://tcnos.github.io/infinity-releases/report/.
A static site can't hold a write token, so the form POSTs here; this Worker
verifies a Cloudflare Turnstile token (anti-spam) and files a GitHub issue in
`tcnos/infinity-releases` using a server-side token. Anonymous reporters need no
GitHub account.

## One-time setup

### 1. GitHub token (scoped)
Create a **fine-grained PAT**: owner `tcnos`, only repo `tcnos/infinity-releases`,
permission **Issues: Read and write**. Copy the value.

### 2. Cloudflare Turnstile (free anti-spam)
Cloudflare dashboard → Turnstile → **Add site** → domain `tcnos.github.io`.
You get a **Site key** (public, goes in the web page) and a **Secret key**
(goes in the Worker).

### 3. Deploy the Worker
```bash
cd bug-report-worker
npm i -g wrangler            # if not installed
wrangler login
wrangler deploy             # first deploy → prints the Worker URL
wrangler secret put GITHUB_TOKEN       # paste the PAT from step 1
wrangler secret put TURNSTILE_SECRET   # paste the Turnstile secret from step 2
```
Note the deployed Worker URL, e.g. `https://infinity-bug-reporter.<you>.workers.dev`.

### 4. Wire the web page
In `../report.md`, set the two public constants near the top of the script:
```js
const WORKER_URL         = 'https://infinity-bug-reporter.<you>.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAA...';   // Turnstile SITE key (public)
```
Commit & push; the form goes live. Until these are set, the page shows a
"not yet configured" notice instead of a broken form.

## Labels
The Worker tags issues with `bug` and `from-site`. Make sure those labels exist
in the repo (created during setup):
```bash
gh label create bug       --repo tcnos/infinity-releases --color d73a4a --force
gh label create from-site --repo tcnos/infinity-releases --color 0e8a16 --force
```

## Notes
- Issues are **public** (public repo), so the form intentionally does **not**
  collect reporter email. The reporter gets the issue URL to follow instead.
- Turnstile blocks bots; for extra safety you can add a Cloudflare rate-limit
  rule on the Worker route.
