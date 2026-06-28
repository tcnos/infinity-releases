#!/usr/bin/env node
/**
 * render_release.mjs — turn GitHub release(s) into Jekyll collection page(s)
 * under _releases/<tag>.md.
 *
 * Single source of truth for both:
 *   - the backfill (the full releases array from `gh api .../releases`), and
 *   - the publish workflow (one release from the `release` event payload).
 *
 * Input (stdin): either a single GitHub release object, OR an array of them.
 * Reads only: tag_name, name, body, published_at, created_at, html_url,
 * draft, prerelease.
 *
 * Output: writes _releases/<safeTag>.md per non-draft release (relative to cwd)
 * and prints each path. No dependencies — runs on plain Node.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', c => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

// A release tag is also the filename + URL slug. Keep it filesystem/URL safe
// without losing readability (v0.10.0 stays v0.10.0).
function safeSlug(tag) {
  return String(tag).trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

// Releases below this version are NOT published to the public site — everything
// before it is folded into the hand-authored "Initial Release" page
// (_releases/initial.md). The raw GitHub Releases still exist; this only controls
// what the site renders, and stops a backfill from resurrecting old notes.
const MIN_TAG = process.env.MIN_RELEASE_TAG || 'v0.9.0';

function parseVer(tag) {
  const m = String(tag).trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function ltMinTag(tag) {
  const a = parseVer(tag), b = parseVer(MIN_TAG);
  if (!a || !b) return false; // unparseable tag → don't filter it out
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

// YAML-safe double-quoted scalar via JSON.stringify (escapes quotes/backslashes).
const y = s => JSON.stringify(String(s ?? ''));

function renderOne(rel) {
  if (rel.draft) {
    console.error(`render_release: skipping draft ${rel.tag_name || '(no tag)'}`);
    return null;
  }
  const tag   = rel.tag_name || rel.name || 'untagged';
  if (ltMinTag(tag)) {
    console.error(`render_release: skipping ${tag} (< ${MIN_TAG}; folded into Initial Release)`);
    return null;
  }
  const slug  = safeSlug(tag);
  const title = rel.name || tag;
  const date  = (rel.published_at || rel.created_at || '').slice(0, 10);
  const body  = (rel.body || '').replace(/\r\n/g, '\n').trimEnd();
  const url   = rel.html_url || '';

  // {% raw %} guards the release body from Liquid so braces in code blocks
  // (e.g. ${VAR}, {{ }}) render literally. kramdown still processes the markdown.
  const out = `---
layout: release
version: ${y(tag)}
title: ${y(title)}
date: ${y(date)}
prerelease: ${rel.prerelease ? 'true' : 'false'}
source_url: ${y(url)}
---
{% raw %}
${body}
{% endraw %}
`;
  const outPath = join('_releases', `${slug}.md`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out, 'utf8');
  console.log(outPath);
  return outPath;
}

const raw = await readStdin();
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error('render_release: invalid JSON on stdin:', e.message);
  process.exit(1);
}

const list = Array.isArray(parsed) ? parsed : [parsed];
let count = 0;
for (const rel of list) {
  if (renderOne(rel)) count++;
}
console.error(`render_release: wrote ${count} page(s)`);
