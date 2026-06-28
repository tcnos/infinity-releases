---
layout: default
title: Releases
---
<h2 style="margin-top:0;">All releases</h2>

<ul class="rel-list">
{% assign rels = site.releases | sort: 'date' | reverse %}
{% for r in rels %}
  <li>
    <span class="date">{{ r.date }}</span>
    <a href="{{ r.url | relative_url }}">
      <span class="ver">{{ r.version }}</span>
    </a>{% if r.prerelease %}<span class="badge">pre-release</span>{% endif %}
    {% assign headline = r.title | remove_first: r.version | remove_first: " — " | strip %}
    {% if headline != "" %}<span class="title">{{ headline }}</span>{% endif %}
  </li>
{% endfor %}
</ul>
