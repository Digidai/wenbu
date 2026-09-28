# Quality and review evidence

Verification date: 2026-09-28. Records distinguish local checks, deployed responses, browser checks and search outcomes.

## Completed checks

- Production build: 63 HTML pages; 60 indexable pages. Journal pages and 404 are noindex.
- Typecheck: Astro and Worker TypeScript, zero errors/warnings.
- Tests: 54 passing, covering calendar fixtures and edge cases, all64hexagram identities, tarot invariants, API validation/origin/body boundaries, actual SQLite quota queries and MCP messages.
- ESLint: passing.
- Static audit: 2390 internal link/asset references, canonical destinations, locale alternates, JSON-LD and metadata checked.
- Production dependency audit: zero reported vulnerabilities at check time. This is not a promise that dependencies have no unknown issues.
- Secret scan of every built asset: the provided key was absent. .dev.vars is Git-ignored; secrets are Cloudflare Worker secrets.
- Official DeepSeek authentication and real synthetic requests: successful. Requested deepseek-v4-flash; served deepseek-flash. See local-ai-smoke.json and live-smoke.json.
- CLI: actual HTTP call from public/wenbu.mjs; known all-yang hexagram returned1.
- Cloudflare first deployment: live custom hostname and TLS verified. workers.dev and preview URLs disabled.
- Live smoke: 60 indexable pages plus8public assets/error routes; all four APIs; official MCP Client initialize/list/call/resource listing; privacy headers; invalid-input, oversize and foreign-Origin checks. See live-smoke.json.

## Browser checks

Codex browser at desktop viewport and390×844mobile viewport:
- Homepage, responsive navigation, typography and bespoke SVG illustration.
- BaZi example chart, visible element counts, mobile no-horizontal-overflow.
- Actual DeepSeek request with explicit consent and synthetic data; structured result, model provenance and remaining allowance.
- Save reading and note, navigate to journal and open persisted details.
- English tarot: three separate selection actions produce three distinct cards; card reveal, reversed label and mobile layout checked.
- I Ching: real cast, original/resulting hexagrams and marked moving lines; context-export preview.
- Zi Wei: live calculation and final local traditional branch-position layout; selectable palace, stars and age interval; mobile layout checked.
- No browser console errors in inspected tool flows. Additional browser engines, real mobile hardware, Lighthouse and real-user Core Web Vitals are not claimed as tested.

## grok-cli review

### Architecture review — completed
Invoked installed grok-cli read-only against the design contract and Wrangler config before runtime implementation. Its P0 entries were missing implementation requirements, not observed production defects.

Disposition:
- Calendar conventions, DST rejection, late Zi options, unknown-hour omission and upstream/independent fixtures implemented.
- Singleton global SQLite object, atomic dual-counter reservation, input/output limits, timeout and explicit Shanghai day implemented.
- Stateless Web-Standard MCP; both slash variants; real official-client smoke implemented.
- POST-only private payloads, no-store/noindex responses, explicit selected context and privacy statements implemented.
- IPv6 /64 grouping, request rate limit, custom host only, real canonical/hreflang/sitemap implemented.
- Alarm pruning preserves current-day allowance and expires older rows.

Two recommendations were deliberately not adopted:
1. Refund every failed upstream request: a timed-out provider can still bill. Attempts remain counted and this is disclosed.
2. Accept Origin:null and arbitrary loopback Origins on production: native clients omit Origin; only production same-origin is accepted in browsers, with loopback allowed solely for local development targets.

### Implementation review — in progress at initial source publication
The broad read-only attempt and first focused attempts did not produce final findings within their bounded observation windows; logs included a telemetry export network error. An isolated grok-cli session was started for the supplied source snapshot. Raw CLI logs are retained locally and ignored by Git; they are not evidence of a completed review until a final report exists. The final disposition will be appended when available.

## Defects found and repaired during implementation

- Removed fabricated noon time from unknown-hour result display.
- Fixed quota alarm so it cannot reset the current day or delete the SQL table.
- Excluded JSON-LD blocks from executable CSP hashing, keeping Cloudflare header lines below2000characters. Verified live CSP.
- Corrected Skill download path, CLI example flag, source link and404language alternates.
- Prevented aborted AI responses from attaching to a new calculation; reset consent for new charts.
- Update a saved reading by stable ID instead of duplicating it after AI/note changes.
- Preserve original question, selected context and model provenance in saved readings.
- Reject I Ching interpretation input without original lines instead of silently casting again.
- Added accessible name to the mobile journal icon; fixed duplicated“宫”suffix.
- Keep secrets out of browser builds and public Git files.

## Bounds of this release

Calendar outputs follow the disclosed engine conventions; no “all schools agree” or prediction-accuracy claim. Live success is not search submission, indexing, ranking or traffic. No GSC/Bing submission, paid product testing, trademark clearance, registrar purchase, broad browser certification or uptime/SLA result is asserted.
