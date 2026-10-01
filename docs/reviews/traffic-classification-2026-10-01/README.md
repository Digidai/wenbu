# Traffic classification upgrade · 2026-10-01

Separate browser page views, public content requests and service outcomes. Add actor type/name/purpose, evidence/version, resource format and HTTP method/status. Known UA signatures remain declared identities. Trusted Cloudflare verification, signatures and score are stored only when present; missing evidence is null. Browser hints do not prove a human. Preserve legacy records without guessing identities or reconstructing uncollected historical crawls.

## Verification before release

- Full `npm run verify`: type checks, 264 tests across 19 suites, 91-page build and site/art/knowledge/IndexNow audits passed. `npm run lint` passed. Subsequent bounded edits to cookie-failure handling and the unknown edge entry-page value passed targeted analytics regressions.
- `0004_traffic_classification.sql` applied locally. Synthetic real-HTTP probes passed for browser, search bot, AI search/training bot, user fetch, automation, unknown and CLI, plus HEAD, opt-out, private-page exclusion and event deduplication. These are declared-UA probes, not evidence of actual Google/OpenAI visits.
- All 1/3/7/14/30/90-day report presets and combined filters reconcile totals, dense curves and rankings. CSV export preserves the exact applied filters, timezone and cutoff from the JSON snapshot.
- Headed Chromium: 1280, 768 and 390 px; no page exceptions or document overflow. Combined actor/purpose filters, export controls and Chinese/English privacy preference persistence passed. An initial QA locator used label text including nested options; role-based selectors completed the checks.
- Private R2 v3 archives retain classification evidence, version and response fields. Existing v2 archive downloads and history/feedback behavior stay intact.
- Grok CLI was attempted with supplied source, no tools and no subagents. It returned HTTP 402, usage balance exhausted. **No Grok review verdict was obtained.**

## Production release

Pending source CI, additive D1 migration, Worker deployment and production verification. Update this section only after those actions complete.

Metric definitions, coverage and official references: [analytics.md](../../analytics.md). Operations: [operations.md](../../operations.md).
