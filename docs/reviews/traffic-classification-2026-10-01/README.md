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

PR [#5](https://github.com/Digidai/wenbu/pull/5) merged. Source `f6e7e2b66f4120a5370c8e3595d8be914bbc56cf` deployed as Worker `0e8f6026-682d-449d-be6a-8ede374c4ef3`. PR Quality [36881387195](https://github.com/Digidai/wenbu/actions/runs/36881387195) passed; merged-source [Quality 36881643678](https://github.com/Digidai/wenbu/actions/runs/36881643678) also passed. Remote D1 migration executed 14 commands successfully.

Production synthetic collector probes and read-only report reconciliation passed, including all six date presets and combined classifier/resource filters. Headed production UI passed 1280/768/390 px, five preset controls, actor/purpose filters and CSV/JSON parity. Evidence contains declared-UA tests, not verified real crawler identities. New telemetry uses UA evidence when native CF bot fields are unavailable.

Production console retains a pre-existing rejection of Cloudflare's injected optional beacon by CSP. The first-party collector and dashboard work independently, with no page exception. This external integration is not claimed fixed. IndexNow deploy hook respected existing backoff, submitted 0 in this run; no indexing/ranking claim.

A production browser probe typed before the React panel hydrated and lost the input. Follow-up disables login controls until ready and displays a preparation state. A local delayed-component test confirmed disabled controls before hydration, enabled controls afterward, and preserved typing. Follow-up [PR #6](https://github.com/Digidai/wenbu/pull/6) merged as `a2c5f2a3cc88365c3b665f8a4cc7841533df1145`, deployed as Worker `0ed266cc-ba9d-4264-b545-638d57b55b6d`. PR [Quality 36883121544](https://github.com/Digidai/wenbu/actions/runs/36883121544) and merged-source [Quality 36883455704](https://github.com/Digidai/wenbu/actions/runs/36883455704) passed. Production delayed-download test confirmed both readiness states and preserved input; Chinese/English opt-out persisted across navigation and ingestion returned accepted 0. Privacy tests wait for the preference component to hydrate before interacting.

Final production check matched built body prefixes on both private dashboard and privacy translations and compared four JS/CSS assets byte-for-byte. Read-only report presets/filter reconciliation passed again against the final Worker. Sixteen inspected content-request records had no native Bot Management fields, so this sample's classification is UA/browser/unknown evidence; no CF verification is claimed for it. Those test records do not establish the actual account plan or all possible future bot traffic.

Evidence-only closeout commits do not change the deployed runtime. No assertion of actual search indexing, GEO citations, human identity or traffic growth is made.

Metric definitions, coverage and official references: [analytics.md](../../analytics.md). Operations: [operations.md](../../operations.md).
