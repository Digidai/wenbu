# Analytics trends and filters · 2026-09-29

## Change

The private `/insights/` Overview now has 1/3/7/14/30/90-day presets, inclusive custom dates, Shanghai/UTC selection and hourly/daily granularity. Six switchable lines show page views, anonymous browser IDs, sessions, successful calculations, completed Agent turns and service failures. Source, page, device, completed-call and service-outcome bars, a 24-hour activity histogram and session-coverage bars complement the trend. The original detailed tables, history, feedback and archives remain available.

All visualizations and exports describe one applied report snapshot. Draft filters do not relabel old data. Dimensions are allowlisted; invalid inputs return 400; SQL values are bound parameters. Future slots are null, elapsed empty slots are zero and the active slot is partial. Summary visitors/sessions are deduplicated across the whole period; bucket uniques are not additive. Rankings retain the complete denominator rather than silently cutting at 30 categories. Internal Agent tool phases remain excluded from request outcome totals.

Overview presets now use calendar dates including today. History/feedback retain rolling windows; [analytics documentation](../analytics.md) explains the difference, feature-event versus page filters, snapshot/export semantics and measurement limits. No schema, data retention or secret change is required.

## Local validation

- Astro/Worker type checks, 178 tests in 14 files, ESLint, production build and site/art audits.
- Report tests use SQLite: Shanghai/UTC midnight boundaries, all preset lengths, inclusive custom dates, zero-filled gaps, null future slots, received-time cutoffs, multi-dimension predicates, test exclusions, per-period unique counts, ranking denominators and invalid input rejection.
- `scripts/smoke-analytics-trends.mjs` performs read-only API checks. It reconciles additive metric totals, category totals and hourly distribution with the summary, checks auth/privacy headers and range/filter validation, and writes no visitor data into evidence.
- Production dependency audit reports zero known vulnerabilities at validation time. The full dependency install separately reported three moderate development-dependency advisories; this is not an all-dependency clean-audit claim.

## Actual browser checks

Codex IAB at 1280 px desktop and 390 × 844 mobile, against the local Worker and local D1 only. Rich charts use deterministic synthetic events flagged as test traffic; these fixtures were never sent to production.

- All presets: 24/72 hourly rows, then 7/14/30/90 daily rows; full data-table alternative.
- Two custom dates in UTC with source + device filters: 48 hourly points and correctly applied filter chips.
- Country filter with no results: zero metrics, retained time range; remove-chip and reset paths restore data.
- Click a source ranking to narrow the report, then remove it. Pending changes are labelled separately.
- Keyboard left/right navigation reveals point values. The actual CSV download contained 24 data rows, the expected additive total and blank future values. Browser download-event waiting timed out, so the downloaded file itself was inspected as the receipt.
- No horizontal page overflow at either viewport. Mobile chart axes retain both the first and final labels; legend and filters wrap without clipping.
- Fixed a reproduced date-input issue where the displayed date could change before the React filter state caught up. Dates now also update on the native input event; clearing dates keeps the custom controls available with required-field validation.
- A request timeout, abort on logout and request IDs protect against stale results. A failed refresh keeps the previous report and its original date/filter labels.

Local fixture screenshots: [trend](screenshots/analytics-trends-desktop.png) and [mobile](screenshots/analytics-trends-mobile.png). These are UI evidence, not production traffic or acquisition results.

## Review boundary

Two read-only Grok CLI attempts supplied the report source/contract without credentials or analytics data. The first timed out after 180 seconds; a focused attempt with a minimal system prompt timed out after 150 seconds. Neither returned a verdict. Grok review is unverified, not passed. Source inspection, deterministic tests, browser checks, CI and live checks are independent evidence.

The visualization uses pinned Recharts 3.10.1 in the private admin island, with zero-based axes, linear segments, keyboard navigation, a table alternative and no chart animation. Reference: [official LineChart API](https://recharts.github.io/en-US/api/LineChart/). No external analytics script or dashboard service was introduced.

## Release evidence

- Runtime source: `8d9674de43f34e5e6b846c51559f3f823686dec1`, pushed to `main`. [GitHub Quality run 36546229758](https://github.com/Digidai/wenbu/actions/runs/36546229758) passed a clean install, verify (178 tests) and lint.
- Cloudflare Worker `wenbu`, version `a981f577-74d8-412d-91ad-e2c4ad2dab3a`, deployed through Wrangler to `wenbu.genedai.me`. Existing D1/R2 bindings, secrets and hourly archive trigger were retained. No migrations or production test fixtures were applied.
- [Authenticated production checks](analytics-trends-live.json) passed all presets, explicit hourly detail, UTC boundaries, inclusive custom dates, every dimension filter, invalid-query/auth rejection and additive total reconciliation. Evidence contains check outcomes, not private usage counts or identifiers.
- [Served build verification](analytics-trends-assets.json): Chinese and English admin pages contain the built shell and identical referenced asset paths; all five referenced JS/CSS assets match local build bytes. Cloudflare appends its own challenge-platform script before `</body>`; HTML is therefore not claimed byte-identical. The append was identified separately, with no security setting changed.
- Production IAB: authenticated 1-day view showed 24 data rows, test traffic excluded. Desktop 1280 px and mobile 390 × 844 had no horizontal overflow; the mobile 3-day hourly curve rendered correctly. History retained its entry and all six time presets. Inspected console had no errors; logout cleared the report and returned the credential field. Temporary tabs were closed, viewport override reset and the local preview stopped.
- The original checkout's unrelated documentation drafts were preserved. Release evidence is a subsequent documentation-only commit; it does not change the deployed runtime.

No SEO, indexing or growth outcome is inferred from local fixtures or this dashboard release. Additional browser engines and real mobile hardware were not tested.
