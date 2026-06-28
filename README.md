# Infinity Release Notes

Public, auto-generated release notes for the Infinity platform, served via GitHub
Pages at **https://releases.invos.in/**.

## How it works

The source of truth is **GitHub Releases** in the private `tcnos/infinity` repo.
When a release is published (or edited) there, a workflow renders the release into
a Jekyll page in this repo (`_releases/<tag>.md`) and pushes it. GitHub Pages
rebuilds the static site automatically.

- `_releases/` — one Markdown page per release (generated; do not hand-edit)
- `_layouts/`  — page templates
- `index.md`   — the release index
- `scripts/render_release.mjs` — turns a GitHub release JSON into a `_releases/*.md`
  page. Shared by the backfill and the publish workflow (single source of truth).

## Re-rendering a single release locally

```bash
gh api repos/tcnos/infinity/releases/tags/v0.10.0 | node scripts/render_release.mjs
```

## Backfill everything

```bash
gh api repos/tcnos/infinity/releases --paginate -q '.[] | @json' \
  | while IFS= read -r r; do echo "$r" | node scripts/render_release.mjs; done
```
