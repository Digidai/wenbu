# Agent workspace release · 1.1.0

Release date: 2026-09-28. Public entry: https://wenbu.genedai.me/agent/ and https://wenbu.genedai.me/en/agent/. The original BaZi, I Ching, tarot, Zi Wei and journal routes remain available.

## Delivered

- One DeepSeek orchestration loop, ten real tools, visible activity, necessary clarification, selected context and independent result/source panels.
- Actual calculator results and original random draws carried into follow-up; re-reading of sources, report revisions, local conversation history, cancellation, partial recovery and JSON/Markdown export.
- Research on Codex, Claude, Cursor, LangGraph and provider/runtime primary documentation. [Research and decisions](../research/agent-harness-2026-09-28.md).
- CLI streaming Agent command, six native MCP tools, updated Skill, OpenAPI, request schema and public protocol documentation.
- Paper/ink/vermilion layout, desktop three panes, mobile chat/results tabs, accessible context dialog and sidebar. All core routes in Chinese and English.

## Verification layers

- **Local:** [101 tests, typecheck, lint, production build and site audit](agent-quality.json), 65 HTML pages / 62 indexable routes / 2,735 internal references. Production dependency audit reported zero vulnerabilities. No credential pattern found in 120 tracked or intended-public files.
- **Cloudflare:** final deployed Worker version `2c277409-2cda-4b0a-b5ff-f6340f209fe1`; same custom domain and existing server secrets. Static assets, API, rate limiter and SQLite quota object are all Cloudflare-hosted.
- **Public regression:** [live-smoke.json](live-smoke.json) verifies 62 indexable pages plus 10 resource/error URLs, all four calculators, six advertised MCP tools and an official MCP client call, privacy headers, invalid input, request size and foreign-origin rejection. Missing Agent consent is rejected.
- **Real model:** [production CLI evidence](agent-live-verification.json) shows a real Zi Wei chart and successful terminal event after two official DeepSeek calls. Requested `deepseek-v4-flash`, provider-reported `deepseek-flash`. Synthetic test data only.
- **Browser:** real local BaZi clarification and form continuation; original tarot cards preserved on follow-up; stop/switch/reload recovery; research sources and report revisions; actual Markdown download inspected on disk. Local mobile viewport 390×844 had no horizontal overflow; inspected local console had zero errors. Production browser acceptance and screenshots are documented below.
- **Grok CLI:** [design](agent-design-review.md), [implementation](agent-code-review.md) and [focused verification](agent-fixes-review.md) and [final closure](agent-final-review.md) returned actual verdicts. Negated redraw, clarification ordering and malformed arguments, required timezone, per-event CLI cap, quota copy, redirect attribution, source URL validation and report context were corrected with regression coverage. Raw inputs/logs stay ignored locally. Source excerpts reviewed are identified in each record; later changes are not silently treated as reviewed.

## Real-model findings and corrections

An earlier real research report had functioning citations but unsupported content claims. It is preserved as **failed content evidence** in [agent-research-verification.json](agent-research-verification.json), not a factual pass. The prompt now specifies the calendar invariants explicitly. Another production research turn consumed its retrieval budget and returned a long chat answer without an artifact. The harness now reserves its penultimate call for `write_report` after evidence has been read. Its regression checks a complete report and final answer within five calls.

## Browser production acceptance

**Follow-up correction:** The original acceptance below recorded a successful final revision but did not treat the preceding citation failure and persistent red status as defects. The user's screenshot correctly identified both problems. The [report retry fix](report-retry-fix.md) adds source preparation before generation and an accurate later-outcome label for the original history, with a new real production revision as evidence.

On the public domain, a fresh research conversation read two local guides, an additional unknown-time note and an actual USNO reference excerpt, then produced a three-section report in the results panel and a final Chinese synthesis. The report correctly distinguishes fixed-instant year/month rules from solar correction of day/hour, avoids an unsupported latitude claim and avoids a universal boundary-minute threshold. It ended without a budget-limit banner. The remaining daily allowance was visible. [Desktop screenshot](screenshots/agent-live-desktop.png) and [mobile screenshot](screenshots/agent-live-mobile.png) show the final public workspace. At 390×844 the document and body widths were both 390px, with no horizontal overflow. The old report could be selected again from the version menu, then the new version restored. The inspected production console contained zero errors. A real production revision rejected an unrefreshed external citation, re-read the USNO page and saved the corrected new report; the earlier failed tool attempt remained visible.

The final visual polish keeps report text fully opaque during its small entrance motion. Tool rounds now show real execution status rather than speculative language-model preambles; only text-only answers are displayed. This was prompted by observed English progress boilerplate in an otherwise Chinese answer.

## Scope

Research covers the curated library and exact allowlisted public reference pages; it is not arbitrary web search or complete-book review. Source access is verified; generated interpretations are not a fact-checking guarantee. Conversations stay in this browser, with no cross-device sync or background execution after closing. Network allowance is 12 Agent turns/day, separate from the original five single readings, within a shared global provider budget. Indexing, rankings, traffic and forecast accuracy are not implied by deployment or tests.
