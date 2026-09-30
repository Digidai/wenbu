# IndexNow integration — 2026-10-01

## Scope

Primary host: `https://wenbu.app`. Added a generated root verification file, deterministic manifest of 84 public canonical pages, D1 receipt/deduplication state, independent 15-minute Cloudflare Cron, authenticated status/manual-run endpoints, and a verified post-deploy hook. [Operations and protocol references](../../indexnow.md).

## Local verification

- `npm run verify`: 221 tests across 17 files; type checks, 91 HTML routes, 84 indexable pages, card assets, 42 handbook editions and the IndexNow asset audit pass.
- `npm run lint` and `git diff --check`: pass.
- Unchanged repeated builds retain manifest revision `9376e896edeb1eade5f92ca8ffd3f83d37053cc78ebac14adbeea32acccf9dd5`.
- [Local Worker checks](local-worker.json): exact key file/MIME, manifest/build parity, `noindex`, admin authentication, D1 status and rejection of local manual submission. No external IndexNow request was made by these checks.
- Regression coverage includes 200 versus 202, addition/edit/deletion, unchanged deduplication, 400/403/422/429/500, transport failure, `Retry-After`, expired/stolen leases, persistence failure, bounded batches and separate cron handlers.
- Migration `0003_indexnow.sql` applied locally and remotely. Only three new IndexNow tables and their index were added; existing analytics/feedback/archive tables were not modified.

## Release verification

Production deployment, initial submission receipt and GitHub CI will be recorded after the release. Local checks and applied migrations do not establish deployment or search indexing.
