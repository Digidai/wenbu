# Grok CLI focused verification · 2026-09-28

Read-only snapshot review, exit 0. The findings below apply to the pre-fix snapshot.

The negated-redraw guard is still open, and the `ask_user` and 429 fixes each leave a concrete hole. Redirect attribution, the CLI per-event cap, stored-URL restore, the BaZi tool timezone override, successful same-batch `ask_user` preemption, and prior-draft citation gating hold in this snapshot.

### Still open

**1. Negated redraw still returns true for ordinary refusals.** `requestsNewDraw` (`worker/agent.ts` 164–175) only rejects a fixed word list, then the positive pattern runs on whatever is left. `allowNewDraw` is `input.newDraw || requestsNewDraw(input.message)` (line 211). With `newDraw` false, these messages still authorize a replacement of an existing tarot or I Ching result:

| Message | Why it still allows a redraw |
|---|---|
| `不能重抽` / `不可以重新抽` / `不准重新起卦` / `不许再抽` / `不需要再抽` / `请勿重抽` / `不重抽` | `不能`, `不可以`, `不准`, `不许`, `不需要`, `勿`, and bare `不` are not in the guard. `重抽`, `再抽`, and `重新(?:抽\|起)` still match. |
| `No, not a new draw` / `not a new draw` | The guard has `no new` and `not to`, not `not` or `not a new`. `new draw` still matches. |
| `redraw? no` | The guard has `no new`, not a final `no`. `^redraw` matches. |

`不要`, `别`, `不再`, `不必`, `不用`, `无需`, `do not`, `don't`, `never`, `if`, `whether`, and quotes do fail closed. That is narrower than the comment at line 165. `别` is also unscoped, so `特别` or `别的不变，重新抽` is refused; any `'` (`let's redraw`, possessives) is refused because `'` is in the guard. Those are fail-closed. The table above is fail-open.

**2. `ask_user` preemption drops sibling tool results, then the next model call still runs if `ask_user` fails.** Lines 317–319 run only `ask_user` when it appears anywhere in the batch, so a draw listed before it does not run. On success, `waiting` stops the turn (349–351, 369) before another `streamDeepSeek`. On `JSON.parse` or Zod failure, the catch writes one `role:'tool'` message for `ask_user` only (353–366), `waiting` stays false, and the loop calls the model again with the assistant `tool_calls` from line 312 still listing the skipped calls. That transcript is missing tool results for those ids. The ordering bug stays closed; the turn fails instead of asking the question.

**3. A missing quota reason is labeled as a personal/network cap and described as the shared site budget.** Lines 201–208 use `quota.reason ?? 'daily_allowance'` for the error code and `quota.reason === 'daily_allowance'` for the message. When `reason` is null or undefined, the code is `daily_allowance` and the text is the shared-budget sentence (“这不是你的个人回合不足”). When `reason` is exactly `daily_allowance`, the network-allowance sentence is used; any other set reason gets the shared-budget sentence.

### Closed in this snapshot

- **Redirect attribution.** `readReference` follows at most two manual redirects and only when the next URL is `https`, has no userinfo and no port, the host is in the catalogue set, and the URL equals that reference after stripping one trailing slash and a fragment (`worker/agent-library.ts` 154–180). A cross-entry target fails that equality check. The emitted source keeps `ref.id` and `ref.url` (220–223).
- **CLI SSE cap.** `public/wenbu.mjs` 55–67 limits one event (the `\n\n` block, or the unparsed tail) to 262144 characters. Earlier events are removed from the buffer, so a long stream of small events is not summed into that cap.
- **Stored URLs.** `restoreSessions` keeps only sources that pass `isSafeSource` (`src/lib/agent-session.ts` 28–41, 74). A bad URL is dropped in `try/catch` instead of throwing out of restore.
- **BaZi tool timezone.** `calculate_bazi` is `birthSchema.safeExtend({ timezone: z.string().min(1).max(80) })` (`worker/agent-tools.ts` 36) and that schema is what `executeAgentTool` parses (115). An omitted timezone does not reach `calculate`.
- **Prior drafts.** `context.reports` is at most two `reportSchema` values (`worker/agent-schema.ts` 75). They are passed through as `priorReportDrafts` and are not inserted into `ctx.sources`. `reference-*` ids in `context.sourceIds` are skipped (`worker/agent.ts` 213–214). `write_report` rejects source ids that were not read or loaded into `ctx.sources` (`worker/agent-tools.ts` 142–146).

### Unverified runtime risks

- `restoreReading` still parses BaZi with `birthSchema`, not the required-timezone override (`worker/agent-schema.ts` 92). A default on that unchanged schema would still turn an omitted timezone into a verified chart. `birthSchema` is not in this snapshot. A whitespace timezone also passes the tool override (`min(1)`).
- Quota reason strings and `reserveAgentStep` are not in this snapshot. Mid-turn denial always says the shared research budget (lines 284–290) and ignores `step.reason`.
- `newDraw: true` bypasses the text guard. The client that sets it is not in this snapshot.
- Live `source` events are appended in `updateMessage` without `isSafeSource` (lines 105–109). Reload filters them; the render path is not in this snapshot. XSS and Markdown-table behavior are not in this snapshot either, so the “94 tests” claim is unchecked.
- Draft text is still a system-message payload inside the object introduced as “Verified tool snapshot and user-selected context” (lines 228–235). The citation-id gate does not stop the model from rewriting draft prose into a new report with empty `sourceIds`.
- Trailing-slash redirects are treated as the same document. The initial catalogue URL is fetched as stored; only redirect targets are forced to `https`. This depends on `redirect: 'manual'` being honored.
- There is no cumulative CLI byte cap, only the per-event cap and a 130s client timeout. The upstream model stream is still capped in aggregate at 1MB (`worker/agent.ts` 88–89).

## Disposition after this review

- Natural-language redraw authorization now accepts only whole affirmative commands. Negated, quoted, hypothetical and mixed requests preserve existing results. Native clients can still explicitly set `newDraw: true`. Regression cases include every refusal listed above.
- Clarification preemption records a skipped result for every sibling tool call. If clarification arguments are malformed, the model receives a complete transcript and can repair them without executing a random draw. Regression exercises this repair.
- Quota code and copy use the same normalized reason; the undefined fallback is consistently the network allowance. Four reason variants are tested. Mid-turn quota always concerns the shared site budget by design.
- Restored BaZi context and new calculations share an explicit, nonblank timezone schema. Invalid restored input is rejected before quota reservation.
- Live source events use the same URL validator as restored sources. User-selected draft, note and birth fields are explicitly labeled untrusted in the context message. Reports remain model-generated interpretations, not a fact-checking guarantee.
