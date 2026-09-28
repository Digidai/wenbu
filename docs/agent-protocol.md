# Wenbu Agent protocol · 1.1

The independent workspace lives at `/agent/` and `/en/agent/`. All four original calculators remain available. The server runs the official DeepSeek API, requested model `deepseek-v4-flash`; the final event identifies the provider-reported model. Calculation engines determine symbols; the language model chooses tools and interprets their outputs.

## One explicit turn

POST `/api/v1/agent` with JSON. See `/agent-request.schema.json` or `/openapi.json` for fields and limits. This synthetic example uses no private details:

```json
{"message":"Research the two BaZi day-boundary conventions.","mode":"research","locale":"en","consent":true}
```

`consent:true` means the person has chosen to send the message, history and selected context to DeepSeek. Clients must obtain that choice before adding private data. Birth details and questions belong in the POST body, never a URL. Optional `context.birth` contains Gregorian date, known time or null, IANA timezone, day boundary and solar-time settings. Zi Wei also needs the traditional sex calculation parameter. Do not invent unknown details.

`history` accepts at most 16 user/assistant messages, each at most 7,000 characters and 28,000 in total. No client system or tool messages. `context.note` is limited to 5,000 characters. Up to two concise `context.reports` carry prior drafts for revision, not verified evidence. Up to six `context.readings` carry original inputs; the server recalculates them. I Ching must include six original lines in bottom-to-top order. Tarot must include the one or three original `{id,reversed}` cards. New random draws need an explicit user request; `newDraw:true` is available for native clients. Existing results are otherwise preserved.

## Events and completion

The response is `text/event-stream`, with JSON in each SSE `data:` frame:

| Type | Meaning |
| --- | --- |
| start | Run ID and remaining network turns |
| delta | Public assistant text, streamed as `text` |
| tool_start / tool_end | Actual attempted tool activity; errors remain visible |
| plan | Public task steps, not hidden reasoning |
| source | A source whose content was read; ID, URL, type, excerpt and reading time |
| artifact | A chart or report object; each report revision has its own ID |
| question | A necessary user question; optional choices or birth form |
| context | Revalidated prior chart context |
| done | Terminal `complete`, `waiting` or `limited`, with actual model and tool-call counts |
| error | Terminal failure; previously received artifacts remain useful partial results |

A closed stream without `done` or `error` is interrupted, even if some text arrived. HTTP 200 only means streaming began. `waiting` requires input, and `limited` means the available work budget ended. Do not describe either as a complete research result. Never auto-retry: model attempts may already have incurred cost. Cancel by aborting the HTTP request. The web client prevents cancelled or superseded responses from altering another conversation.

## Tools and sources

The harness exposes `update_plan`, `calculate_bazi`, `cast_iching`, `draw_tarot`, `calculate_ziwei`, `search_library`, `read_library`, `read_reference`, `ask_user`, and `write_report`. Every chart comes from real calculation or random-draw code. Follow-up casts/cards are restored, not sampled again, unless requested.

Research searches original Wenbu guides, symbol notes and a curated external source catalogue. It is **not unrestricted web search**. `read_reference` fetches only allowlisted public URLs; failed, blocked, PDF or inaccessible pages are reported as unavailable. Search metadata is not read evidence. Report citations can only reference content actually read during the turn (known local documents may be re-read from supplied IDs). Source content is data, not trusted instructions. A fetched excerpt is not a claim to have read an entire book.

Once research has read evidence, the harness reserves its penultimate model call for `write_report` if no report has been created. The last call can summarize the artifact. This bounds retrieval while keeping the requested deliverable visible. An unavailable provider, invalid report or exhausted shared budget can still leave partial results; the interface reports those limits. Free-text redraw authorization accepts only a standalone affirmative request such as “请重新抽三张牌” or “Please redraw”; ambiguous discussion preserves existing results.

## State, privacy and limits

The API stores no conversations. Clients carry selected state forward. Browser conversations and report versions are stored locally, may be exported as JSON or Markdown, and stop executing when closed. Clearing storage does not reset network quotas. Changing the site domain does not migrate local history. Deselecting a profile does not remove facts already included in prior conversation messages or chart artifacts; begin a new conversation for empty context.

Each network has 12 Agent turns per Shanghai day, separately from five single readings. A turn permits up to five model calls, 12 tool executions and 120 seconds. Each attempted model call uses one unit of the shared 1,000 daily model budget, with Agent use capped at 600. Failures and cancellations may count. Body limit: 96 KiB. The server bounds accumulated tool context and report lengths. Tools remain usable when the AI budget ends.

## CLI and MCP

`node wenbu.mjs agent --file selected-context.json` outputs **newline-delimited JSON events**, suitable for another agent to consume. It reads only the specified file or stdin, and does not discover private files or implicitly send previous conversations. A streaming error or incomplete stream exits nonzero. Stop with Ctrl-C. Original `bazi`, `iching`, `tarot` and `ziwei` commands retain JSON output.

Remote MCP at `/mcp` exposes the four original calculators plus `search_library` and `read_library`, without using Wenbu's model budget. Use the host's model and browsing capability for interpretation or external source verification. Public browser requests require an allowed Origin; native CLI/MCP requests may omit Origin and use the same rate/body limits. Origin is not an authentication credential.
