# Grok read-only source review

The tarot gallery and any illustrated reading crash at render, and several analytics totals mix client intent, validation, and rate limits into server success and failure counts. The UTC+8 solar-term fix and the closed analytics vocabulary are sound. I did not run tests or a browser, and production D1, the admin secret, and the cron prune are still unverified.

## P0 — Tarot cards throw on render

`TarotCard` reads `preview` when choosing `loading`, but the component only accepts `card` and `locale`. `TarotGallery` passes `preview` anyway, so it is not in scope.

```tsx
loading={preview ? 'lazy' : 'eager'}
```

With artwork present (`!failed && src`), that expression throws `ReferenceError` before paint. It takes down the gallery and `ReadingView` (one-card and three-card results). TypeScript should fail the build on both the missing name and the extra prop. The fallback “插画暂未载入” never runs for a real image.

Until that is a real prop, the dialog `<img>` is still mounted for every card with no `loading="lazy"`, so a fixed gallery will request each artwork twice (thumb plus hidden lightbox).

## P1 — Analytics semantics and default capture

**Failure KPI is not outages.** `analyticsReport` summary `failures` is `api_failed` OR `agent_finished` in `error|timeout|cancelled`. The worker writes `api_failed` for Zod/input errors and for the rate limiter. The dashboard label “服务失败 / 中断” therefore counts bad requests, quota/rate limits, and cancels with real faults. Status exists on the performance table, but the headline number does not use it.

**Demo calculations are server successes.** `ToolDesk` posts examples to `/api/v1/{tool}` and the worker always records `calculation_succeeded` with `action: 'none'`. The client event has `example` vs `calculate`; the KPI “成功计算” cannot exclude examples.

**API, CLI, and MCP are recorded unless the caller opts out.** `noTracking` is only `DNT: 1`, `Sec-GPC: 1`, or `X-Wenbu-Analytics: off`. The web client sends `off` when disabled. `wenbu.mjs` only adds `X-Wenbu-Client: cli`. Missing header is not off, so CLI/MCP/curl calls store country, coarse UA, tool, status, and duration with no browser toggle. That is weaker than the privacy copy, which describes a browser switch and 30-day visitor ids.

**Funnel “started” / “saved” are client-reported; “succeeded” is not.** Success is a server `calculation_succeeded`, `interpret_succeeded`, or `agent_finished` + `complete` on the same `session_id`. `tool_started` and `journal_saved` are forgeable. SQL does not require time order (`MIN`/`MAX` flags only). The footnote mostly says this; the word “漏斗” and “实际完成” still read as an ordered conversion. `agent_stopped` fires even when `pending.current` is empty, so idle stop clicks inflate the client cancel event (the server metric does not).

**Cancel can be stored as complete.** In `emit`, `metrics.status = event.status` runs before the `cancelled` / `abort` check. `cancel()` sets `cancelled` and then aborts. A `done` event processed after that overwrites `cancelled` with `complete`, and `finishMetric` runs once.

## P1 — Admin route has no limiter

`/api/events` is limited (30/min per `CF-Connecting-IP`). `/api/admin/analytics` is not. Auth is a bearer secret, compared by SHA-256 then XOR, and query tokens are ignored. The page is public (`noindex` only) and the secret sits in React state for the session (not URL or `localStorage`). Without a limit, the endpoint is an online guessing surface. Logout does not invalidate a leaked token; it only clears memory.

## P2 — Resilience and smaller UX gaps

- `flush()` drops the batch before checking `response.ok`. A 429/503 is silent. The 30/min IP limit is shared by NAT, so busy or shared networks lose events first. D1 writes also have no global cap inside a 90-day window.
- One invalid client event fails the whole batch (`eventBatch` is strict, max 10).
- Opt-out stops later sends and deletes the local visitor id. Existing D1 rows stay until the daily `15 19 * * *` prune (90 days). That matches the privacy text; there is no per-visitor delete.
- `initializeAnalytics`’s 15s interval is never cleared (fine on full page loads).
- Turning measurement back on does not emit a page view until the next load. The preference checkbox starts `false` and corrects in `useEffect`.
- Gallery suit chips are hardcoded 78/22/14 and filter `card.suit === 'major'`. `TarotCard` treats `arcana` and `suit` as different fields. If majors do not use `suit: 'major'`, that filter is empty. The deck source was not in this snapshot, so this stays conditional.
- Lightbox dismiss-on-backdrop and `showModal` focus behavior are in place; I could not click through them here. Home and gallery decorative images use empty `alt` with an accessible name on the control. That part is fine.

## What holds up

The 1988 Li Xia case is the right instant: Shanghai civil `15:30` at UTC+9 is `14:30` at fixed `+08:00`, still before `15:01:43`, and `16:02` civil is after the term. Year/month use that fixed zone; the solar-time test keeps year/month on the civil instant and only expects the hour pillar to move. Version text in the methodology page and MCP blurb matches `wenbu-bazi-1.1`.

Client ingestion rejects unknown fields, server event names, raw campaigns, and query/referrer strings. `safePage` collapses unknown paths to `/other/`. Reports bind allow-listed filters. The events table has no IP column; the rate-limit key is not written. Dedup is `INSERT OR IGNORE`. Test rows default out. Insights does not start page analytics.
