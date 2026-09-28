# Deployment and operations

## Runtime

Astro static pages and React islands are built locally/CI. One Cloudflare Worker serves static assets, POST APIs and stateless Streamable HTTP MCP. A single named SQLite Durable Object atomically reserves global and per-network daily AI attempts. Cloudflare rate limiting protects all public computation endpoints. No separate app server, database vendor or third-party analytics script.

## Commands

```sh
npm ci
npm run verify
npm run lint
npm run preview
npm run deploy
```

Use Node.js 22+. Dependencies are pinned in package-lock.json. Tests use Node's experimental SQLite API to execute the actual quota SQL; the DurableObject host is stubbed in unit tests. Local Wrangler and live Cloudflare smoke checks complement, not replace, these tests.

## Secrets

Only Worker secrets DEEPSEEK_API_KEY and QUOTA_SALT are required for optional AI. Set them with `wrangler secret put NAME` using hidden input. Local development may use a mode-0600 ignored .dev.vars file. Never use PUBLIC_ prefixed secrets, commit a key, log Authorization/body content, or embed keys in client assets. The API key provided for this deployment was kept out of source control.

## Budgets and privacy

AI_PER_USER_DAILY_LIMIT=5 for single readings. AGENT_PER_USER_DAILY_LIMIT=12 for conversation turns; AGENT_GLOBAL_DAILY_LIMIT=600 model attempts within the shared AI_DAILY_LIMIT=1000. All reset at Shanghai midnight. Agent reserves one network turn on its first model attempt, then counts each additional attempt against the global and Agent budgets atomically; it does not pre-charge five attempts. The output ceiling is1800 tokens per upstream attempt; question600 characters, selected context1600, total incomingJSON8192bytes. Failed/time-out attempts count because an upstream request can still incur cost. Free use by visitors is funded by the operator's API/Cloudflare account. The daily cap limits usage; it does not mean hosting costs zero.

Agent requests accept up to 96 KiB JSON, 16 prior messages (28,000 characters total), a 3,000-character question and 5,000-character selected note. Each turn allows 5 model calls, 12 tools and 120 seconds; disconnect cancels remaining work. Streams emit public actions, sources and artifacts, never model reasoning. Sessions stay in browser localStorage, not Durable Object storage. Research reads the local library and exact allowlisted public reference URLs, not arbitrary web search. A source is citable only after content has actually been read.

A daily salted HMAC groups IPv4 addresses and IPv6 /64 networks. Shared networks share the allowance. No raw IP or birth chart is persisted by application storage. Current counters are kept through the day; stale days are deleted during reservation and by alarm. Infrastructure providers may maintain operational records under their own policies. Observability payload logging is not enabled.

## Availability

Deterministic tools continue without an AI key or when upstream is unavailable. No payment flow or subscription. Treat 422 as user input feedback,429as throttling,502/503as service failure. Do not automatically retry an AI request: this can consume another attempt and upstream charge. Check /api/health for configuration readiness; it does not reveal secrets and is not a live upstream test.

If deepseek-v4-flash retires, verify the official model migration notice and test a synthetic request before changing DEEPSEEK_MODEL. Keep requested and served model provenance in responses.

## Release / rollback

Run typecheck, tests, lint, production build and static audit before deploying. Use `wrangler deployments list` and `wrangler rollback VERSION_ID` for code rollback; understand that Durable Object storage/migrations are separate. Do not delete quota storage to fix a frontend problem.

Deployment is through the CLI under the user's existing Cloudflare account. GitHub CI validates every change; automatic production deployment is deliberately not claimed until GitHub Cloudflare credentials have been configured. The included workflow needs no deployment secret.

## Future domain

See [brand-and-growth.md](research/brand-and-growth.md). Change all absolute identifiers together and preserve old links with permanent redirects. A hostname change does not automatically migrate localStorage journals; users should export records before switching domains.

## Product analytics

Cloudflare D1 `wenbu-analytics` is bound as `ANALYTICS`; schema is versioned in `migrations/0001_analytics.sql`. Apply migrations before code deployment:

```sh
npx wrangler d1 migrations apply wenbu-analytics --local
npx wrangler d1 migrations apply wenbu-analytics --remote
npx wrangler secret put ANALYTICS_ADMIN_TOKEN
npx wrangler whoami
npm run deploy
```

The database and production secret were provisioned for the 2026-09-29 release. Do not recreate them for routine deployments. The administrator opens `/insights/` and supplies the secret in the password field. An ignored mode-0600 `.analytics-admin-token` file contains the initial local copy; do not publish it. The report API requires `Authorization: Bearer ...`, sends no-store/noindex, and has a separate rate limit. See [analytics.md](analytics.md) for dimensions, privacy, opt-out and definitions.

Cron `15 19 * * *` deletes raw events older than 90 days. Indexes bound time-window reads and retention deletes. Monitor D1 reads, writes, storage and Worker errors in Cloudflare; growth requires daily pre-aggregation before repeatedly querying large 90-day ranges. Public page beacons are approximate product measurement; server calculation receipts are recorded independently. Neither is a billing ledger.

QA sets `X-Wenbu-Test: true` for native requests or `sessionStorage['wenbu.analytics.test']='true'` in the dedicated QA browser tab before loading the page. Test traffic is excluded from the default dashboard. Automated smoke now sets this header, including MCP. Do not clear production tables to reset QA.

Worker rollback does not roll back D1 schema or data. This initial migration only adds a separate analytics table; the previous app version can continue without it. Keep the database through code rollback. The final deployment and actual receipt checks are recorded in [deck-analytics-release.md](reviews/deck-analytics-release.md).

## Issue reporting

Use GitHub issues with synthetic data. Never post birth details or keys in public bug reports. Reproduce calendar issues with exact timezone, date, chosen convention and expected independent reference.
