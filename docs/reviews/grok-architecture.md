# grok-cli architecture review

Returned on 2026-09-28 before implementation. This is the original report, not a release sign-off. See README.md for implementation dispositions and the separate incomplete implementation review.

## Scope

Read: `docs/plans/2026-09-28-wenbu-design.md`, `wrangler.jsonc`, plus `package.json` and `astro.config.mjs` to see what is already pinned. The repo has no `worker/index.ts` (Wrangler’s `main`), no `UsageGate`, no calendar or MCP code, no pages, and no `robots.txt`, sitemap, or `llms.txt`. Nothing outside the repo was read. No network calls.

What already matches: SQLite class `UsageGate` is bound as `QUOTA`; AI caps are vars (`1000` global, `5` per user); the model id is `deepseek-v4-flash`; `/api/*` and `/mcp` are `run_worker_first`; the site URL is `https://wenbu.genedai.me`; Astro is static with `trailingSlash: 'always'`.

## P0

**1. Calendar accuracy is required and undefined.**

The contract says BaZi uses `lunar-typescript` with explicit time zone, midnight/late-Zi (晚子时), and clock-time rules, and that Zi Wei states its school. It never states those rules. `package.json` pins `lunar-typescript@1.8.6`, `iztro@2.6.1`, and `@js-temporal/polyfill`, but there is no call site.

A Worker runtime treats civil `Date` components as UTC. A shared engine that uses `new Date(y, m, d, h)` or `Date.parse` on a zone-less string will disagree with the browser. That is the failure mode the contract has to close.

Write a normative input and these boundaries, then lock them with golden fixtures:

- Input is a civil local date-time plus an IANA zone. Unknown hour yields a null hour pillar, not noon.
- Pin one 晚子时 rule for both BaZi and Zi Wei, including the library switch (`sect` / time index). A 23:30 and a 00:30 fixture must show the day pillar and the 时辰 index.
- 年柱 changes at the 立春 instant. 月柱 changes at the 节 instant, not lunar new year, not 气, not midnight.
- DST gaps and overlaps are resolved with `Temporal.ZonedDateTime` (earlier, later, or reject). Cover `Asia/Shanghai` 1986–1991, a `America/New_York` spring gap and fall overlap, and the same clock time in `Asia/Shanghai` and `Asia/Urumqi`.
- Say whether 真太阳时 is in scope. If it is, require a longitude and name the function. If it is not, the methodology page must say charts use standard clock time.
- Forbid host-local `Date` parsing inside the shared layer.

**2. The atomic quota cannot be implemented from this contract, and call count does not bound cost.**

`AI_DAILY_LIMIT` and `AI_PER_USER_DAILY_LIMIT` are strings in `vars`. No `UsageGate` source exists. “One SQLite Durable Object caps per-IP and global counts” still allows a non-atomic implementation: a DO id derived per IP makes the global `1000` a cross-object total. There is no transaction boundary, no token cap, and no byte cap. Body limits are required but not quantified. A context export sent to `deepseek-v4-flash` can dominate spend inside a single counted call. Failed calls and retries are unspecified, so a timeout loop can keep the upstream request without sticking the counter.

Implement only this shape:

- One singleton: `idFromName("global")`. Per-IP rows live in that SQLite database, not in separate objects.
- Parse both limits as base-10 integers. If they are missing or not positive, refuse AI.
- In one storage transaction, reserve one global unit and one IP unit, or reject. Persist only `day`, IP hash, and counts.
- Call DeepSeek only after a reservation, from the Worker, with a fixed `max_tokens` and `AbortSignal`. Commit on success. Release the reservation on failure. Do not hold the Durable Object open during the upstream fetch.
- Define the budget day as a named zone (recommend `Asia/Shanghai`) via `Temporal`, not the Worker UTC date and not the user’s zone.
- Put a numeric body cap next to the limits (8 KiB is enough for a reading plus selected context).
- Every model call, including MCP tools, uses this gate. The CLI and the skill file do not get the DeepSeek secret.

**3. MCP Streamable HTTP is not specified for a Worker, and the route can drop POSTs.**

The contract requires a Streamable HTTP endpoint and an official-client test of initialize, list, and call. It does not pin the protocol revision, the client version, or a Worker transport. `@modelcontextprotocol/sdk@1.30.1` is declared. Whether that build exports a Fetch/Web-Standard transport was not verified. `nodejs_compat` does not make Node’s `IncomingMessage` HTTP transport valid on Workers.

`run_worker_first` lists `/mcp` only. Astro forces trailing slashes. A global slash redirect on `/mcp` turns a POST into a GET and breaks the handshake. An in-memory session map dies when the next request hits another isolate. Putting session arguments in `UsageGate` would also store birth data, which the contract forbids.

Implement:

- Stateless Streamable HTTP on the Web-Standard transport. No session table.
- Accept `/mcp` and `/mcp/` in the Worker with no redirect. Keep slash redirects on HTML routes only.
- Pin the protocol version and the official client version in the test command.
- Separate origin policy: browser API allows `https://wenbu.genedai.me`; MCP also accepts no `Origin`, `Origin: null`, and loopback clients. Require `Accept: application/json` and `text/event-stream` on POST.
- Publish the tool list. Deterministic tools do not take a quota unit. AI tools do.

**4. “No persistent birth data” does not cover the actual transfer path.**

The contract forbids birth data in server storage, puts private fields in POSTs, and says shared links omit them. It also requires user-selected context in AI and agent requests. That context is sent to DeepSeek. Upstream retention and training use are not in either file. A Durable Object session, a Worker log line, a cached GET, or an error that echoes the body would violate the storage rule even if the happy-path table looks clean. `observability.enabled` is `false`, which removes one log sink and does not constrain application logs.

Implement:

- Durable Object writes are limited to quota counters. Reject any other column in review.
- API and MCP responses use `Cache-Control: no-store` and `X-Robots-Tag: noindex`, and error bodies are fixed codes.
- Context export has a named schema and an explicit field allowlist. The CLI sends only the file the user passed.
- Share URLs are static public pages. Reading state stays in memory. A test asserts the copied URL has no birth fields or question text.
- Privacy copy states that an AI action transmits the selected context to the official DeepSeek endpoint and that Wenbu does not store it.

## P1

**Free-tier abuse around the AI cap.** With no account, per-IP `5` is not an identity. IPv6 rotation walks around it until the global `1000` holds, and only if P0.2 is real. Calculation routes are explicitly uncapped, so CPU abuse does not need the model. `workers_dev: true` publishes a second host beside `SITE_URL`. Observability is off, so reservation leaks are invisible.

Fix: key IPv6 by a `/64` hash; add a cheap limit or in-browser calc for non-AI routes; turn `workers_dev` off in production; count only rejects and commits in the Durable Object; optional Turnstile on the AI POST alone.

**Quota day and string vars.** Document the `Asia/Shanghai` day key in the same place as the numeric limits. Fail closed on bad var parsing.

**SEO URL contract is a slogan until it is a table.** “Self-canonical, language alternatives, sitemap, robots” does not name the path scheme, `x-default`, or `zh-Hans` versus `zh-Hant`. `html_handling` is unset while Astro emits trailing slashes, so `/path` and `/path/` can both return 200. `workers.dev` can be indexed as a duplicate. `<html lang>` is not required.

Fix: one table of absolute trailing-slash URLs; reciprocal `hreflang`; canonical equals that URL; sitemap lists only those URLs; `html_handling: "force-trailing-slash"` for assets; 301 every other host to `SITE_URL` for document GETs; set `lang` per route. Emit `hreflang` only when the alternate HTML exists.

**MCP versus browser origin.** One allowlist of `https://wenbu.genedai.me` will fail desktop clients. Covered by the P0.3 split; the tests are the P1 deliverable.

## P2

- `not_found_handling: "404-page"` is one page for two languages. Use a language-neutral 404, or let the Worker choose from the locale prefix.
- JSON-LD stays `WebSite`, `Article`, and `SoftwareApplication`. No `Review` or `AggregateRating`, consistent with the ban on fake testimonials.
- `llms.txt` may list only public URLs whose visible HTML is the cited text.
- Quota keys should be hashed and deleted after the budget day. The contract currently forbids persisting birth data and says nothing about IP retention.
- Call the Durable Object only from AI entry points, not from page views or deterministic tools.

## Requirements versus unverifiable claims

| Statement in the contract | Status |
| --- | --- |
| Explicit time zone, 晚子时, clock time, stated Zi Wei school, no LLM calendar math | Requirement. The rules and the engine are absent, so accuracy is unverified. |
| Fixtures for DST, 节气, and unknown time | Acceptance requirement. No fixtures exist. |
| SQLite DO atomically caps per-IP and global daily AI calls | Requirement. Binding exists. Enforcement code does not. |
| Body limits, schemas, timeout, abort, safe errors, origin policy, CSP | Requirements with no numbers, allowlists, or header values. |
| Official DeepSeek only; return the upstream model id; server-only secret | Requirements. Endpoint behavior and billing were not checked. No network. |
| Free Cloudflare use | Unverified. Plan name, Durable Object allowance, and CPU limits are not in these files. The app cap is 1000 calls, not a currency ceiling. |
| MCP initialize / list / call with the official client | Requirement. No server, no pinned client, no result. |
| Personal data is POSTed and excluded from indexing | Requirement. No handler and no robots output to inspect. |
| Self-canonical, `hreflang`, sitemap, robots, Open Graph, JSON-LD, server-rendered body | Requirements. `src/pages` is empty. |
| `llms.txt` is not a Google ranking signal | Product claim about Google. Reasonable, and not evidence of index behavior. |
| Dependency versions implement the needed APIs | Unverified. Pins exist; call sites and upstream docs were not executed or fetched. |

No calculation bug, quota race, MCP handshake failure, or SEO defect is asserted in running code. Those sources are not in the repository yet.
