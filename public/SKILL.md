---
name: wenbu
description: Use Wenbu for BaZi charts, I Ching casts, tarot draws and Zi Wei charts, with explicit user-selected context and calculation conventions.
---

# Wenbu · 问卜

Use when the user asks for a chart or symbolic reading. Explain that symbolic interpretation is not established prediction. Do not infer hidden personal details, retrieve unrelated conversations or upload workspace files.

## Connection

Remote MCP: `https://wenbu.genedai.me/mcp` (Streamable HTTP, stateless).
Tools: `calculate_bazi`, `cast_iching`, `draw_tarot`, `calculate_ziwei`, `search_library`, `read_library`.
No API key. Use your host model for interpretation.
HTTP fallback: POST JSON to `https://wenbu.genedai.me/api/v1/{bazi|iching|tarot|ziwei}`.
Schema: `https://wenbu.genedai.me/openapi.json`.

## Workflow

1. Ask which tradition and which question the user wants to explore. Use only their selected context.
2. For BaZi, request Gregorian date, local time (or explicitly unknown) and IANA time zone. Surface midnight versus 23:00 day-boundary convention. Solar correction is optional and needs longitude.
3. For Zi Wei, require known local civil time and the traditional sex parameter; explain its calculation role. Do not fabricate an unknown time.
4. For I Ching, pass six 6/7/8/9 lines bottom to top if supplied, otherwise request a random cast. For tarot choose one or three cards and optional reversals.
5. Call the tool once. Preserve the returned result; do not repeatedly cast until a preferred result appears.
6. Separate returned calculations, traditional symbolism, your interpretation and practical next actions. Keep warnings and conventions. Do not fabricate classical quotations or infer element strength from counts.
7. Invite the user to save or export only when they want. A Wenbu context file omits original birth details by default but can still contain sensitive information; inspect its fields with the user before onward sharing.

## Boundaries

Do not assert certain futures, medical diagnoses, financial outcomes, marriage decisions or reasons for death. Do not recommend fear-based purchases. For important decisions, use ordinary evidence and qualified support. Personal data sent to the API reaches Wenbu's Cloudflare infrastructure; nothing grants permission to read another application's context.

## Local CLI

Download `https://wenbu.genedai.me/wenbu.mjs`; inspect it first. Run with Node.js 22+ and a JSON file or stdin so birth details do not enter shell history. No dependency installation.


## Research and built-in Agent

Search the bounded Wenbu catalogue using `search_library`, then read returned guide or symbol IDs using `read_library`. Search results alone are not read evidence. Reference entries describe external sources; verify their actual content with your host browsing capability before citing. Distinguish original editorial material, primary texts, calculation methods and empirical research. Do not invent quotations or imply a full book was read.

The independent workspace is https://wenbu.genedai.me/agent/ (English: /en/agent/). To ask Wenbu's DeepSeek Agent to perform a turn, use `node wenbu.mjs agent --file selected-context.json` or POST /api/v1/agent. Obtain the user's choice to share their message, history and selected context with DeepSeek; do not add consent or private context on their behalf. Request requires `consent:true`. Protocol: https://wenbu.genedai.me/agent-protocol.md . It streams real progress and structured artifacts, ends with done or error, and does not persist server-side history. Carry forward the original chart input, card identities or six lines for a follow-up; do not redraw unless requested. API/CLI history is explicit; web history is local to the browser. Limits: 12 turns/network/day, up to five model calls and 12 tool executions/turn, within shared global budgets. Stop or timeout may leave useful partial results, not a completed report.
