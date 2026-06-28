---
layout: release
version: "Initial Release"
title: "Platform baseline"
date: "2026-06-26"
prerelease: false
---
The Infinity platform — an end-to-end workspace for angel networks and funds to
run their entire investment lifecycle: sourcing deals, managing the portfolio,
tracking transactions and cap tables, and reporting to investors. This page
summarises the capabilities available at the platform's baseline; everything
released afterwards is listed as a separate version above.

## Funds & access

- **Multi-fund workspace** — run multiple independent funds; switch between them from the sidebar.
- **Fund profile** — name, short code, description, base currency, type, and fund manager per fund.
- **Roles & permissions** — assign users to a fund as **Editor** (read/write) or **Viewer** (read-only); admin-only fund management.
- **Per-fund configuration** — each fund has its own pipeline stages, custom fields, asset types, and forms.

## Company pipeline

- **Four buckets** — **Sourcing**, **Dealflow**, **Portfolio**, and **Archive / Watchlist**.
- **List & kanban views** for every bucket, with drag-to-reorder stage changes.
- **Configurable stages** per bucket (reorder, activate/deactivate).
- **Add companies** with stage assignment, and **search** across the book.

## Company profiles

- **Overview** — identity and legal info (PAN, CIN), sector, deal currency & size, portfolio manager, address (country/state), and remarks.
- **Transactions** — investment rounds with a per-round investor cap table (see below).
- **Investors** — shareholders on the company with commitment, outstanding commitment, call-for-monies, and RBI reporting status.
- **Discussions** — threaded posts and replies (see below).
- **Drive** — the company's document store (see below).
- **Custom fields** — fund-defined structured fields for analyst notes.
- **History** — a full audit trail of changes with actor, timestamp, and field-level diffs.

## Transactions, rounds & cap table

- **Investment rounds** across multiple security types — Equity, CCPS, LEAD, IAN-PL, Debt, CCD, Gold — plus Exit and Balance.
- **Per-round investor tranches** with a spreadsheet-style cap table.
- **Configurable asset types** per fund (enable Equity / Debt / Gold) with **custom columns** for regulatory and certificate details.
- **Multi-currency** rounds with conversion rates, and a toggle between company and fund currency.
- Cost-of-acquisition and balance calculations.

## Investors

- **Investor records** with a prospect → review → onboarded lifecycle, contact details, status, and notes.
- **Investing entities** — manage an investor's sub-entities (individual, HUF, trust, branches) with tax IDs and geography.
- **Entity merge** — consolidate duplicate investor entities, transferring all investments, balances, and fund memberships while preserving history (blocked on conflicting positions in the same round).
- **Investor reporting tabs** — Portfolio (holdings, cost, valuation, holding %, IRR, multiples, exit proceeds), Yearly (transactions by date range), IRR, and custom reports.

## Discussions & Drive

- **Threaded discussions** on companies — posts and replies with a **rich-text editor** and inline **Drive file links**.
- **Legacy timeline imported** — years of historical investment notes, feedback, and deal updates carried over with original authors, dates, and attachments preserved.
- **Inline file preview** — PDFs, images, video, audio, and text open in a new tab; other types download.
- **Per-fund and per-company Drive** — folder hierarchy, uploads, rename, and file sharing.

## Forms & inbox

- **Form designer** — build multi-section public application forms with text, number, date, URL, email, dropdown, file-upload, and company-ID fields, with per-field validation.
- **Public application URLs** — publish unauthenticated forms (`/apply/:fundCode/:slug`) for founders to submit deals.
- **Submissions inbox** — review incoming submissions (pending / accepted / rejected); accepting one **auto-creates a company** in Sourcing.

## Reports & dashboard

- **Portfolio dashboard** — KPIs (active/past companies, investors, capital deployed, exit proceeds, rounds), sector distribution, rounds-by-type, IRR distribution, and top companies by valuation.
- **Reports** — per-investor transaction, yearly, and IRR reports, plus a portfolio-wide rollup.

## Platform

- **Notifications** — in-app bell with unread count and deep-links to the relevant record; mark-all-read.
- **Concurrent-edit locks** — prevent two people from editing the same company at once.
- **Managed lists & lookups** — admin-configurable dropdown values (e.g. Company Type) used across forms and profiles.
- **Account** — personal profile and password management.
