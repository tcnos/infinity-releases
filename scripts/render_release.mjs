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

// YAML-safe double-quoted scalar via JSON.stringify (escapes quotes/backslashes).
const y = s => JSON.stringify(String(s ?? ''));

function renderOne(rel) {
  if (rel.draft) {
    console.error(`render_release: skipping draft ${rel.tag_name || '(no tag)'}`);
    return null;
  }
  const tag   = rel.tag_name || rel.name || 'untagged';
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
