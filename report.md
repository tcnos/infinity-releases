---
layout: default
title: Report a bug
permalink: /report/
---
<a class="back" href="{{ '/' | relative_url }}">← All releases</a>
<h1 style="margin:0 0 6px; letter-spacing:-0.02em;">Report a bug</h1>
<p class="rel-meta">Spotted something broken? Tell us what happened — it goes straight to our tracker. No account needed.</p>

<div id="br-notice" style="display:none; background:#fef3c7; color:#92400e; border:1px solid #fde68a; border-radius:10px; padding:12px 14px; font-size:14px; margin-bottom:16px;"></div>

<form id="br-form" style="display:grid; gap:14px; max-width:640px;">
  <label style="display:grid; gap:5px;">
    <span style="font-weight:600; font-size:14px;">Summary <span style="color:#dc2626;">*</span></span>
    <input name="title" required maxlength="140" placeholder="e.g. Saving a company resets the portfolio date"
      style="padding:9px 11px; border:1px solid #d1d5db; border-radius:8px; font:inherit;">
  </label>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <label style="display:grid; gap:5px;">
      <span style="font-weight:600; font-size:14px;">Area</span>
      <select name="area" style="padding:9px 11px; border:1px solid #d1d5db; border-radius:8px; font:inherit; background:#fff;">
        <option value="">— choose —</option>
        <option>Companies / Pipeline</option>
        <option>Company profile</option>
        <option>Transactions / Rounds</option>
        <option>Investors</option>
        <option>Discussions</option>
        <option>Drive / Files</option>
        <option>Forms / Inbox</option>
        <option>Reports / Dashboard</option>
        <option>Settings / Admin</option>
        <option>Other</option>
      </select>
    </label>
    <label style="display:grid; gap:5px;">
      <span style="font-weight:600; font-size:14px;">Severity</span>
      <select name="severity" style="padding:9px 11px; border:1px solid #d1d5db; border-radius:8px; font:inherit; background:#fff;">
        <option value="">— choose —</option>
        <option value="low">Low — minor / cosmetic</option>
        <option value="medium">Medium — annoying, has a workaround</option>
        <option value="high">High — blocks a task</option>
        <option value="critical">Critical — data loss / outage</option>
      </select>
    </label>
  </div>

  <label style="display:grid; gap:5px;">
    <span style="font-weight:600; font-size:14px;">What happened? <span style="color:#dc2626;">*</span></span>
    <textarea name="description" required rows="4" maxlength="8000" placeholder="What did you expect, and what happened instead?"
      style="padding:9px 11px; border:1px solid #d1d5db; border-radius:8px; font:inherit; resize:vertical;"></textarea>
  </label>

  <label style="display:grid; gap:5px;">
    <span style="font-weight:600; font-size:14px;">Steps to reproduce <span style="color:#9ca3af; font-weight:400;">(optional)</span></span>
    <textarea name="steps" rows="3" maxlength="8000" placeholder="1. Go to…&#10;2. Click…&#10;3. See…"
      style="padding:9px 11px; border:1px solid #d1d5db; border-radius:8px; font:inherit; resize:vertical;"></textarea>
  </label>

  <div id="br-turnstile"></div>

  <div style="display:flex; align-items:center; gap:12px;">
    <button id="br-submit" type="submit"
      style="background:#4338ca; color:#fff; border:none; border-radius:8px; padding:10px 18px; font:inherit; font-weight:600; cursor:pointer;">
      Submit report
    </button>
    <span id="br-status" style="font-size:14px;"></span>
  </div>
</form>

<p style="color:#6b7280; font-size:13px; margin-top:18px;">
  Reports are filed publicly in our tracker, so please don't include passwords or personal data.
  We don't collect your email here.
</p>

{% raw %}
<script>
(function () {
  // ── Configure these two PUBLIC values after deploying the Worker (see
  //    bug-report-worker/README.md). Both are safe to expose in the page. ──
  const WORKER_URL         = 'REPLACE_WITH_WORKER_URL';
  const TURNSTILE_SITE_KEY = 'REPLACE_WITH_TURNSTILE_SITE_KEY';

  const form    = document.getElementById('br-form');
  const notice  = document.getElementById('br-notice');
  const statusEl = document.getElementById('br-status');
  const submit  = document.getElementById('br-submit');
  const tsBox   = document.getElementById('br-turnstile');

  const configured = !WORKER_URL.includes('REPLACE_WITH') && !TURNSTILE_SITE_KEY.includes('REPLACE_WITH');

  if (!configured) {
    notice.style.display = 'block';
    notice.textContent = 'The bug reporter isn’t configured yet. Once the backend is deployed this form goes live; in the meantime, please report bugs through your usual channel.';
    submit.disabled = true;
    submit.style.opacity = '0.5';
    submit.style.cursor = 'not-allowed';
    return;
  }

  // Load Turnstile (explicit render so we control the sitekey)
  let widgetId = null;
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true; s.defer = true;
  s.onload = function () {
    widgetId = window.turnstile.render(tsBox, { sitekey: TURNSTILE_SITE_KEY });
  };
  document.head.appendChild(s);

  function setStatus(msg, color) {
    statusEl.textContent = msg;
    statusEl.style.color = color || '#6b7280';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const token = window.turnstile ? window.turnstile.getResponse(widgetId) : '';
    if (!token) { setStatus('Please complete the anti-spam check.', '#dc2626'); return; }

    const fd = new FormData(form);
    const payload = {
      title:       fd.get('title'),
      area:        fd.get('area'),
      severity:    fd.get('severity'),
      description: fd.get('description'),
      steps:       fd.get('steps'),
      turnstileToken: token,
    };

    submit.disabled = true; submit.style.opacity = '0.6';
    setStatus('Sending…', '#6b7280');
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        form.style.display = 'none';
        notice.style.display = 'block';
        notice.style.background = '#dcfce7';
        notice.style.color = '#166534';
        notice.style.borderColor = '#bbf7d0';
        notice.innerHTML = 'Thanks! Your report was filed as issue #' + out.number +
          '. <a href="' + out.url + '" target="_blank" rel="noopener" style="color:#166534; text-decoration:underline;">Track it here →</a>';
      } else {
        setStatus((out && out.error) || 'Something went wrong. Please try again.', '#dc2626');
        submit.disabled = false; submit.style.opacity = '1';
        if (window.turnstile) window.turnstile.reset(widgetId);
      }
    } catch (err) {
      setStatus('Network error. Please try again.', '#dc2626');
      submit.disabled = false; submit.style.opacity = '1';
      if (window.turnstile) window.turnstile.reset(widgetId);
    }
  });
})();
</script>
{% endraw %}
