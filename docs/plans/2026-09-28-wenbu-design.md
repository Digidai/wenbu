# Wenbu · 问卜 — product and implementation contract

Date: 2026-09-28. Owner: Gene Dai. Origin: https://wenbu.genedai.me.

## Product decision

Wenbu (wen-boo) means asking an oracle in Chinese. Five ASCII letters work as a repository, hostname, CLI and spoken name. Build a bilingual, free web product around useful symbolic reflection, accurate calendar mechanics, and sources users can inspect. This is not a scientific prediction service.

Three directions considered: a paid conversational oracle (strong immediate engagement, weak free economics), a large horoscope content farm (easy to generate, little differentiated value), and an instrument-led free product (chosen: useful tools, public methodology, a learning library, personal journal and agent interfaces).

No account needed. No fake testimonials, traffic counters, expert credentials, guarantees or purchase pressure. Keep deterministic tools usable when AI is unavailable or the daily budget is exhausted. Shared links never include birth details or private questions. Journal is local to the device and exportable. User-selected context is explicitly included in AI/agent requests; no background extraction.

## Visual direction

A modern printed almanac: warm paper, ink, vermilion, moss, hairline rules, large editorial typography, an animated astronomical instrument, restrained reveals, tactile card selection and chart transitions. Real data drives five-element diagrams and chart labels. Keyboard navigation, screen-reader status, readable contrast, reduced-motion support and mobile layouts are release requirements.

## Runtime

Astro generates HTML pages for both languages; React islands provide interactive tools. Cloudflare Workers serves the API and static assets. A SQLite Durable Object atomically caps per-IP and global daily AI calls; no birth data in persistent server storage. Official DeepSeek endpoint only, requested model `deepseek-v4-flash`, with actual upstream model returned as provenance. Server-only secret. Body limits, input schemas, timeout, abort, safe errors, origin policy and CSP.

Pure calculation layer shared by the website API, REST and MCP. BaZi uses lunar-typescript with explicit time-zone, midnight/late-Zi and clock-time conventions. Zi Wei uses iztro with its school stated. I Ching uses unbiased cryptographic coin draws and King Wen mapping; Tarot uses a full 78-card deck without replacement and explicit reversals. No LLM calendar arithmetic. No invented source quotes or accuracy scores.

## Content and distribution

Tool landing pages, a substantial learning library, methodology, sources, about, privacy, terms, free-use policy, comparison pages and developer documentation. Self-canonical, language alternatives, sitemap, robots, Open Graph, appropriate JSON-LD, descriptive internal links and server-rendered body text. llms.txt serves discovery for agents; it is not presented as a Google ranking signal. No fabricated search volume or promised traffic.

MCP Streamable HTTP endpoint, versioned JSON API, OpenAPI, portable SKILL.md, zero-dependency Node CLI and a JSON context export. Personal data is POSTed and excluded from indexing. Public content can be linked and cited independently of a reading.

## Verification and reviews

Compile/type checks, meaningful fixtures for calendar/DST/solar-term/unknown-time cases, exhaustive hexagram mapping and tarot uniqueness, API validation, privacy/abuse cases, MCP initialize/list/call with the official client, crawler/links/schema checks, dependency audit and browser visual/interaction checks. Use installed grok-cli in read-only mode to review architecture, implementation and final repairs. Keep an honest release ledger distinguishing local, deployed and live results. Do not claim complete coverage of all world traditions or guaranteed future traffic.

## Execution

1. Source/brand research and contract.
2. Calculation engines and secure Cloudflare API.
3. Bilingual editorial UI, tools, journal and context exchange.
4. Learning, comparison and developer content.
5. Grok review, targeted repairs and verification.
6. GitHub source release and Cloudflare deployment, then live verification.
