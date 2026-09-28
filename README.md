# Wenbu · 问卜

**Old wisdom. A present perspective.**

Free bilingual tools for BaZi, I Ching, tarot and Zi Wei, with visible calculation conventions, optional DeepSeek reflections and a private local journal.

[Website](https://wenbu.genedai.me/) · [English](https://wenbu.genedai.me/en/) · [Agent guide](https://wenbu.genedai.me/en/agents/) · [Research](docs/research/landscape-2026-09-28.md) · [Documentation](docs/README.md)

## What works

- Four Pillars with explicit timezone, unknown-hour handling, midnight/Zi boundary options and approximate solar correction.
- Three-coin I Ching: six recorded lines, changing lines, original and resulting hexagrams.
- A complete 78-card tarot deck, unbiased drawing without replacement and optional reversals.
- Zi Wei twelve-palace charts with disclosed iztro conventions.
- Structured AI reflections through the official DeepSeek API; requested model deepseek-v4-flash, actual served model recorded.
- Browser-only saved readings and notes; JSON context preview/export with birth details omitted by default.
- Stateless MCP, a dependency-free Node CLI, a Skill and OpenAPI 3.1.
- Chinese and English static pages, original guides, comparisons, source notes, sitemap and RSS.

These are cultural and reflective tools, not scientifically established predictions. Calendar correctness and symbolic interpretation are deliberately separate.

## Run locally

Requires Node.js22+.

```sh
npm ci
npm run verify
npm run preview
```

Open http://localhost:8787. For UI-only development, `npm run dev` provides Astro; the production-style Wrangler preview also supplies API/MCP endpoints.

AI is optional. Use an ignored .dev.vars with server-only DEEPSEEK_API_KEY and QUOTA_SALT. See [operations](docs/operations.md).

## Agent integration

Connect a Streamable HTTP client to `https://wenbu.genedai.me/mcp`.
Tools: calculate_bazi, cast_iching, draw_tarot, calculate_ziwei. No account or model key required; your agent interprets the structured results with its own model.

```sh
node public/wenbu.mjs iching '{"lines":[7,7,7,7,7,7]}'
node public/wenbu.mjs tarot '{"count":3,"reversals":true}'
node public/wenbu.mjs bazi --file birth.json
```

Use a file or stdin for personal data to avoid shell history. Review [the Skill](public/SKILL.md) before installation. Nothing automatically reads another app's context.

## Architecture

Cloudflare Static Assets + Workers + SQLite Durable Object + rate limit binding. Astro7/React19. lunar-typescript1.8.6, iztro2.6.1, Temporal, official MCP SDK. Fonts are self-hosted; illustrations and modern interpretive prompts are original. All deploy-time infrastructure is on Cloudflare; AI calls use DeepSeek's official endpoint.

## Free use

All calculators, draws and the local journal are free without signup. Optional AI allows five attempts per network per Shanghai day, subject to a1000attempt global daily budget. Operator infrastructure and upstream costs still apply. Failed upstream attempts count. No paid upsell, tracking SDK, commercial deck artwork or fabricated reviews.

## Quality and scope

See [review and verification evidence](docs/reviews/README.md). Automated checks cover calendar edge cases, all64hexagram identities, random-draw invariants, API boundaries, quota SQL and MCP protocol. Real browser and deployed smoke tests are recorded separately. Search indexing and traffic are downstream outcomes, not assumed from successful deployment.

MIT license. Third-party packages retain their licenses. Research distinguishes verified facts, vendor statements, analysis and pending validation.
