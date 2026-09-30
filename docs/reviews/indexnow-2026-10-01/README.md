# IndexNow integration — 2026-10-01

## Scope

Primary host: `https://wenbu.app`. Added a generated root verification file, deterministic manifest of 84 public canonical pages, D1 receipt/deduplication state, independent 15-minute Cloudflare Cron, authenticated status/manual-run endpoints, and a verified post-deploy hook. [Operations and protocol references](../../indexnow.md).

## Local verification

- Initial `npm run verify`: 221 tests across 17 files; type checks, 91 HTML routes, 84 indexable pages, card assets, 42 handbook editions and the IndexNow asset audit pass. Runtime regression additions bring the suite to 224 tests, including 28 IndexNow tests; full tests, types and lint pass locally.
- `npm run lint` and `git diff --check`: pass.
- Unchanged repeated builds retain manifest revision `9376e896edeb1eade5f92ca8ffd3f83d37053cc78ebac14adbeea32acccf9dd5`.
- [Local Worker checks](local-worker.json): exact key file/MIME, manifest/build parity, `noindex`, admin authentication, D1 status and rejection of local manual submission. No external IndexNow request was made by these checks.
- Regression coverage includes 200 versus 202, addition/edit/deletion, unchanged deduplication, 400/403/422/429/500, transport failure, `Retry-After`, expired/stolen leases, persistence failure, bounded batches and separate cron handlers.
- Migration `0003_indexnow.sql` applied locally and remotely. Only three new IndexNow tables and their index were added; existing analytics/feedback/archive tables were not modified.

## Release verification

- [PR #3](https://github.com/Digidai/wenbu/pull/3) merged; initial [CI run](https://github.com/Digidai/wenbu/actions/runs/36746150409) passed. Final source `6bcfa4f2579e151058c9d986856e436efc50eff8` includes the production runtime fixes. Its [CI run](https://github.com/Digidai/wenbu/actions/runs/36747734614) passed, including all 224 tests and build/audit/lint gates; [saved result](ci.json).
- [Cloudflare control-plane evidence](cloudflare.json): Worker version `552c2451-2856-4bd6-b902-3d0c6b0a8f9f`, 100% traffic, with both schedules confirmed by the API.
- [Read-only status during schedule propagation](status-during-propagation.json) did not yet show an autonomous invocation at 17:01 UTC. The deployed handler, admin invocation and configured schedule are verified separately; this release does not claim an observed successful cron delivery.
- All three custom domains and both cron expressions are retained. The 15-minute IndexNow schedule is separate from the hourly analytics archive.
- [Live site smoke](live-site.json) passed: 94 page/asset checks, all four calculation APIs, discovery of six MCP tools and bilingual handbook reads. The check did not invoke the paid model.
- [Live IndexNow checks](live-indexnow.json) verify the public UTF-8 key, deployed manifest, private status authorization, preserved pending URLs and backoff without a duplicate external request.
- Production workerd rejected `redirect: 'error'` despite accepting that value in its type definitions. The transport now uses `manual` and treats 3xx responses as failures without forwarding the payload; regression tests cover 301, 302 and 307. The first two failed attempts remain recorded rather than being erased. Their retry windows were released once each during the corresponding transport repair; the later upstream 429 retry window has been retained.
- After the compatibility fix, IndexNow returned **HTTP 429**. All **84 URLs remain pending**, with zero received fingerprints. Automatic checks are active and respect the persisted retry time. No successful submission, crawl or indexing claim is made.
- Grok CLI was attempted twice: the first run encountered the temporary local network failure, and the second returned no verdict within 180 seconds. Grok review is **unverified**; it is not counted as a passed gate.
