# Private feedback and retained usage history

Verified on 2026-09-29. This release adds feedback collection and durable, queryable behavioral history for product analysis. It does not automatically copy conversation, birth-input or result bodies into analytics. The unresolved product question about full-text history was handled with a conservative default: explicit, editable excerpt sharing in feedback, off by default.

## Shipped behavior

- Bilingual feedback is available across public pages, tool results and completed Agent messages. Agent has a toolbar button that remains clear of mobile controls. The form supports a rating, category, note, optional email and selected excerpt preview. Feedback can still be submitted with analytics disabled; identifiers are omitted in that case.
- Feedback receipts are idempotent. The administrator can inspect a private item, follow its linked operation and update its workflow state with revision checks. Bulk list exports exclude email and shared excerpts; detail access is authenticated.
- Behavioral history links browser start, server outcome, displayed result and feedback by operation ID. Separate conversation, page and visit IDs preserve their different meanings. Agent tool phases record type, duration and outcome, without arguments or result text.
- An IndexedDB outbox retries browser events after connectivity returns or the page reloads. Server event UUIDs remove delivery duplicates. Browser privacy choices, DNT/GPC and explicit native-client opt-outs remain effective.
- D1 retains recent event rows for 90 days. An hourly Worker job writes older events to immutable, private R2 NDJSON archives before those rows become eligible for pruning. Upload failure keeps the source rows. Manifests contain checksums; lease ownership prevents overlapping maintenance work. Archive and feedback retention currently have no automatic expiry.
- `/insights/` provides overview, event history, feedback and archives. Events can be filtered and followed by session, operation, conversation or visitor ID. The private export script follows every page and verifies archive hashes. Archives and D1 overlap and must be deduplicated by event ID.

See [analytics](../analytics.md) for metrics, consent, filtering and export instructions, and [operations](../operations.md) for migration, credentials and archive-before-prune rollback precautions.

## Source, infrastructure and deployment

Runtime commits:

- `14c19ef595a907ff391d0e2be9333117e641302e`: feedback, linked history, archive implementation, tests and contracts.
- `8ff42600d97bf6be4dd981116b029cce68363c81`: R2 binding, hourly schedule and rate limits.
- `7174048c383f4ae787c53e618338d4f4fe77b409`: mobile Agent feedback placement and the `read_library` phase classification.

The additive D1 migration `0002_feedback_history.sql` was applied remotely. The private `wenbu-analytics-archive` bucket was created and bound as `ANALYTICS_ARCHIVE`; its public development URL was verified disabled. Existing Worker secrets were preserved. The final runtime deployment is Cloudflare Worker version `f392904e-89ff-4191-a20a-344a770dad9a`, serving `wenbu.genedai.me` with cron `15 * * * *`.

All three runtime commits passed GitHub CI. The final runtime [Quality run 36537141604](https://github.com/Digidai/wenbu/actions/runs/36537141604) passed from a clean install. Subsequent documentation/evidence commits do not change the deployed runtime.

## Local and automated checks

- 150 tests in 13 files passed, including actual SQLite migrations and transactional archive SQL, feedback retry/conflict/consent, private route authentication and origin validation, frozen pagination, archive failure/retry and concurrent maintenance, and server Agent phase metadata.
- Astro/Worker checks passed with zero errors, warnings or hints; ESLint passed. Production build generated 89 pages. The site audit checked 4,405 internal references and 84 indexable pages. Existing 78-card illustrations, back and thumbnails passed asset checks.
- Local browser feedback submission was tested with the excerpt unchecked, then with only an explicitly edited synthetic excerpt shared. The server received exactly the intended context. Private detail viewing and feedback state changes were exercised.
- A browser event blocked from the endpoint survived a reload in IndexedDB and was received once after restoring delivery. Opt-out cleared the pending queue and identifiers. These are delivery tests, not a claim of universally lossless telemetry.
- Chinese and English feedback were checked on desktop and a 390 × 844 viewport. The mobile English dialog measured 354 px within a 390 px page, without horizontal overflow. The Agent toolbar placement was checked locally and after the final deployment.

## Production evidence

All submitted records below are synthetic QA data marked `is_test=1`; they are excluded from default product reports. No real user record was edited or removed for verification. The [structured verification record](feedback-history-live.json) contains only synthetic receipts and check results.

1. Browser feedback receipt `f9b881c7-e0c8-4122-a02c-b29224f9e98d` was stored successfully. Its operation `46eb8cf3-40ec-45d3-8137-0b11e3833150` joins `tool_started`, `calculation_succeeded`, `result_viewed` and `feedback_opened`. No excerpt was submitted. The deployed admin UI retrieved the same receipt using this operation filter.
2. Fresh production events were correctly left unarchived until they had aged one day. A separate synthetic event, `59fcb64a-1ca1-4dcd-94fe-d2e2719e253d`, then had only its own receive timestamp backdated for the retention test. Manual authenticated maintenance archived it to actual private R2. Downloaded bytes, manifest count and SHA-256 matched, and the fixture was found in the file. No non-test timestamp was changed. Natural 90-day expiry cannot be observed on release day; pruning behavior is covered by SQLite tests.
3. Real DeepSeek operation `f5739efa-8f56-4289-9e33-722f8690eb07` completed with three model calls and three library-tool phases. The provider reported requested model `deepseek-v4-flash` and served alias `deepseek-flash`. The aggregate completion and all three phases were stored. This exposed a missing `read_library` action label, fixed in the final runtime commit; the earlier test record was not rewritten. The corrected mapping was source-checked and covered by final type/test/CI checks, without consuming another model turn solely to change that old receipt.
4. The final runtime passed the [live smoke check](live-smoke.json): 94 page/asset/error routes, four calculation APIs, all six MCP tools and bilingual library reads. The smoke run does not call a model; the separate real request above supplies that evidence.

Public UI proof: [feedback form on the deployed site](feedback-history-ui.png). Private analytics and credentials are deliberately not reproduced in public screenshots.

## Review and repairs

Manual source review and targeted checks repaired several defects before closeout: feedback detail fields leaking into the local list export after a status update; pagination windows shifting between pages; memory-fallback loss counters; cross-tab opt-out state; back-forward-cache visit tracking; export overwrite risk; mobile Agent feedback overlap; and the library-read action label.

The requested installed Grok CLI was exercised with source snapshots and read-only file access. A small health request returned `READY`, but the substantive reviews timed out. File mode read the archive/outbox modules and reported that it was checking callers and schema; it did not return a finding list or final verdict. A follow-up asking for the existing findings also timed out. **Grok implementation review remains incomplete, not passed.** No inferred favorable verdict is claimed, and successful tests/CI/live checks are separate evidence. Only source was supplied; secrets and private analytics were excluded from review inputs.

## Limits to use when interpreting the data

- “Full history” means retained received structured events. It is not a recording of every private input, a screen replay, an identity system or a billing ledger. Earlier missing or deleted data cannot be recovered.
- Browser blockers, opt-outs, interrupted writes and storage failures limit collection. The outbox is bounded to 1,000 events / seven days and can fall back to memory. Queue losses emit a best-effort gap event.
- Server analytics failure does not fail the user's calculation. It emits a fixed, payload-free operational error signal. There is currently no durable server-message queue; events can be lost while D1 is unavailable.
- Archive maintenance processes at most 2,500 events/hour (about 60,000/day). The storage panel exposes backlog and status; sustained growth requires higher throughput and daily summary tables. No unlimited-scale or zero-cost claim is made.
- Admin reports query the recent 90-day window; older detail is available through private archive exports. Feedback is separate from event archives. “Archived” feedback is a workflow status, not deletion.
- These checks do not establish traffic growth, search indexing, predictive accuracy, a security certification or all-browser coverage.
