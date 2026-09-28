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

AI_PER_USER_DAILY_LIMIT=5, AI_DAILY_LIMIT=1000; both reset on Shanghai midnight. The output ceiling is1800 tokens per upstream attempt; question600 characters, selected context1600, total incomingJSON8192bytes. Failed/time-out attempts count because an upstream request can still incur cost. Free use by visitors is funded by the operator's API/Cloudflare account. The daily cap limits usage; it does not mean hosting costs zero.

A daily salted HMAC groups IPv4 addresses and IPv6 /64 networks. Shared networks share the allowance. No raw IP or birth chart is persisted by application storage. Current counters are kept through the day; stale days are deleted during reservation and by alarm. Infrastructure providers may maintain operational records under their own policies. Observability payload logging is not enabled.

## Availability

Deterministic tools continue without an AI key or when upstream is unavailable. No payment flow or subscription. Treat 422 as user input feedback,429as throttling,502/503as service failure. Do not automatically retry an AI request: this can consume another attempt and upstream charge. Check /api/health for configuration readiness; it does not reveal secrets and is not a live upstream test.

If deepseek-v4-flash retires, verify the official model migration notice and test a synthetic request before changing DEEPSEEK_MODEL. Keep requested and served model provenance in responses.

## Release / rollback

Run typecheck, tests, lint, production build and static audit before deploying. Use `wrangler deployments list` and `wrangler rollback VERSION_ID` for code rollback; understand that Durable Object storage/migrations are separate. Do not delete quota storage to fix a frontend problem.

Deployment is through the CLI under the user's existing Cloudflare account. GitHub CI validates every change; automatic production deployment is deliberately not claimed until GitHub Cloudflare credentials have been configured. The included workflow needs no deployment secret.

## Future domain

See [brand-and-growth.md](research/brand-and-growth.md). Change all absolute identifiers together and preserve old links with permanent redirects. A hostname change does not automatically migrate localStorage journals; users should export records before switching domains.

## Issue reporting

Use GitHub issues with synthetic data. Never post birth details or keys in public bug reports. Reproduce calendar issues with exact timezone, date, chosen convention and expected independent reference.
