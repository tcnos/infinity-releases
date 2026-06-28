/**
 * Bug-report proxy — Cloudflare Worker.
 *
 * Receives a bug report (JSON POST) from the public release-notes site, verifies
 * a Cloudflare Turnstile token (anti-spam), then files a GitHub issue in the
 * target repo using a server-side token. The token NEVER reaches the browser.
 *
 * Secrets (set via `wrangler secret put`, NOT committed):
 *   - GITHUB_TOKEN     fine-grained PAT, Issues: Read & write on the target repo
 *   - TURNSTILE_SECRET Cloudflare Turnstile secret key
 * Vars (wrangler.toml):
 *   - ALLOW_ORIGIN     e.g. https://tcnos.github.io
 *   - TARGET_REPO      e.g. tcnos/infinity-releases
 */
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

    let data;
    try { data = await request.json(); } catch { return json({ error: 'Invalid request body.' }, 400, cors); }

    const title       = (data.title || '').toString().trim();
    const description = (data.description || '').toString().trim();
    const steps       = (data.steps || '').toString().trim();
    const area        = (data.area || '').toString().trim();
    const severityIn  = (data.severity || '').toString().toLowerCase();
    const token       = (data.turnstileToken || '').toString();

    if (!title || !description) return json({ error: 'Please provide a title and a description.' }, 400, cors);
    if (title.length > 140)     return json({ error: 'Title is too long.' }, 400, cors);
    if (description.length > 8000 || steps.length > 8000) return json({ error: 'Report is too long.' }, 400, cors);
    if (!token) return json({ error: 'Please complete the anti-spam check.' }, 400, cors);

    // 1) Verify Turnstile server-side
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    }).then(r => r.json()).catch(() => ({ success: false }));
    if (!verify.success) return json({ error: 'Anti-spam check failed. Please try again.' }, 403, cors);

    // 2) Compose + create the issue
    const severity = ['low', 'medium', 'high', 'critical'].includes(severityIn) ? severityIn : 'unspecified';
    const bodyParts = [
      description,
      steps ? `\n**Steps to reproduce**\n${steps}` : '',
      `\n**Area:** ${area || 'unspecified'}`,
      `**Severity:** ${severity}`,
      `\n---\n_Filed via the release-notes site bug reporter._`,
    ];
    const issue = {
      title: `[Bug] ${title}`,
      body: bodyParts.filter(Boolean).join('\n'),
      labels: ['bug', 'from-site'],
    };

    const ghRes = await fetch(`https://api.github.com/repos/${env.TARGET_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'infinity-bug-reporter',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });

    if (!ghRes.ok) {
      const detail = (await ghRes.text()).slice(0, 300);
      console.error('GitHub issue create failed', ghRes.status, detail);
      return json({ error: 'Could not file the report right now. Please try again later.' }, 502, cors);
    }
    const created = await ghRes.json();
    return json({ ok: true, url: created.html_url, number: created.number }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
