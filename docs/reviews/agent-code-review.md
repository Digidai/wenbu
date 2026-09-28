# Grok CLI code review · 2026-09-28

The initial 12-turn read-only run reached its turn limit without a verdict. A continuation returned the actual review below; later changes were explicitly excluded from its clearance.

In the snapshot I inspected, one production blocker remains: the random-result reuse guard opens on the product’s own “do not redraw” recovery text. Quota atomicity, arbitrary-URL SSRF, the markdown path I read, cancellation in the UI, partial recovery, and the original calculate/interpret routes did not show a second blocker. The later `requestsNewDraw()` helper, GFM tables, drawer focus trap, and the jump from 85 to 89 tests were not in this snapshot and are not cleared.

## Blocker

**A follow-up that says not to redraw is treated as permission to replace the cast or spread.** `allowNewDraw` is a substring test:

```195:199:worker/agent.ts
  const allowNewDraw =
    input.newDraw ||
    /(重新|再抽|再起|重抽|重起|新的一卦|new (draw|cast|spread)|draw again|another (card|spread)|recast|redraw)/i.test(
      input.message,
    );
```

The error-recovery button sends exactly the strings that match it: Chinese `不要重新抽取` contains `重新`, and English `do not redraw` contains `redraw` (`src/components/AgentWorkspace.tsx` 771–776). With the guard open, `executeAgentTool` falls through to a new calculation (`worker/agent-tools.ts` 166–180). For the I Ching, supplied `lines` are kept as a manual cast (`src/lib/iching.ts` 21–23), so the model can replace the verified six lines; with no lines, it is a new cryptographic cast. Tarot always draws again. The same regex also matches ordinary follow-ups such as `重新解释` and `再起来`. The existing test uses `再解释一下`, which does not contain those substrings (`tests/agent.test.ts` 161–182).

Fix: decide a new draw only from `newDraw: true` or an explicit positive request, and keep the previous result when the message negates that request. While a previous result exists, ignore model-supplied lines. Recheck the new `requestsNewDraw()` against the recovery strings, `重新解释`, `再起来`, and a hypothetical “if I asked you to redraw.”

## Other verified defects

**`ask_user` still runs tools placed before it in the same batch.** The loop breaks only after that call (`worker/agent.ts` 304–337). A batch of `draw_tarot` then `ask_user` draws first and then pauses. The test covers only `ask_user` first (`tests/agent.test.ts` 184–196). Fix: if any call is `ask_user`, run that call alone and return tool errors for the rest.

**BaZi fills in a missing timezone.** `birthSchema` defaults timezone to `Asia/Shanghai`, time to `null`, and the day boundary to midnight (`src/lib/schema.ts` 4–18). The agent tool parses that schema, so `{ date }` becomes a Shanghai chart. Zi Wei still requires time and sex. Fix: on the agent path, reject a missing timezone instead of applying those defaults, and use the selected birth profile when one is present.

**The CLI size cap can reject a valid chunk of several complete events.** `public/wenbu.mjs` 54–56 measures the whole buffer before splitting on `\n\n`. Fix: extract complete events first, and apply the 256KB cap to the remainder and to each event.

**A shared-budget refusal is described as the user’s personal allowance.** Every failed `reserveAgent` uses the same 429 text (`worker/agent.ts` 187–192) while `quota.ts` 52–55 also returns `agent_budget` and `daily_budget`. Fix: branch the message on `reason`.

**A redirect may be cited as the original catalogue entry.** `readReference` accepts any exact catalogue URL on an allowed host (`worker/agent-library.ts` 163–178) and then returns the original `ref.url` and title (`219–227`). Two entries share `zh.wikisource.org`. Fix: allow only the requested URL after one canonical normalization. I did not fetch those pages, so a live cross-redirect is unproven.

**A stored source with a bad URL throws during render.** `new URL(source.url)` at `AgentWorkspace.tsx` 941 runs with no guard, and `restoreSessions` only checks that `sources` is an array (`src/lib/agent-session.ts` 42–50). Fix: keep `http:`/`https:` URLs and skip the rest.

## Checked, no blocker in this snapshot

- **Quota.** `transactionSync` updates the shared 1000, the Agent sub-budget, and the 12-turn counter without an `await` inside the transaction (`worker/quota.ts` 33–72). Later model calls go through `reserveAgentStep`. Original readings keep a separate identity and still reserve when the Agent sub-budget is full. Failures are not refunded.
- **SSRF.** Reference fetches start from a catalogue id, use manual redirects, require `https`, reject userinfo and ports, and require an exact catalogue URL (`worker/agent-library.ts` 144–193).
- **XSS in the markdown I read.** `AgentMarkdown.tsx` uses `skipHtml`, blocks `img`/`iframe`/`script`, and renders a link only when `href` is an exact allowed source URL. Report and chat text go through that path. Tool details and titles are React text.
- **Cancellation and partial recovery.** Stop clears the pending generation, aborts, and sets `stopped` (`AgentWorkspace.tsx` 185–195, 329–331). A later event does not replace that status. `updateMessage` keeps text, finished tools, and artifacts on `error` (`agent-session.ts` 109–117). Reload turns `running` into `stopped`.
- **Context.** Birth is sent only when `useBirth` is set; journals are filtered by the selected ids (`AgentWorkspace.tsx` 284–318). The composer and dialog say the selection goes to DeepSeek and stays in this browser.
- **Original tools.** `/api/v1/{bazi,iching,tarot,ziwei}` still calls `calculate`, and interpret still uses `reserve()` (`worker/index.ts` 121–125`, `worker/ai.ts` quota call). MCP adds catalogue read tools beside the four calculators.

## Unverified risks

- The context dialog sets `max-height` without its own `overflow` (`src/styles/agent.css` 1348–1357). Whether a short phone can scroll to the submit button depends on the browser’s dialog stylesheet.
- The send control is 31×31 CSS pixels (`agent.css` 563–568, 1804–1807), which clears the 24px WCAG 2.2 AA minimum and misses a 44px target. The DeepSeek disclosure drops to 8px on a narrow screen (`1809–1813`).
- In-session charts are still sent after birth sharing is turned off. The preview text says recent charts remain; the always-visible line only says “selected context.”
- Any server abort is labeled `agent_timeout` (`worker/agent.ts` 371–375). Explicit Stop ignores that event because the generation is no longer current.

## Dispositions

- Redraw guard: explicit positive intent plus fail-closed negation/hypothetical checks; UI recovery phrases and model attempts to recast are tested.
- ask_user: preempts the entire batch regardless of call ordering; both orders tested.
- BaZi: Agent-specific schema requires explicit timezone; original standalone tool defaults preserved.
- CLI: size limit is per complete event and pending remainder, not aggregate transport chunk.
- Quota: 429 copy distinguishes network turns from global budget.
- Redirects: only normalized equivalent of the originally requested catalogue URL, never another catalogue entry.
- Stored sources: malformed and non-HTTP(S) URLs are discarded on restore.
- Mobile editor explicitly scrolls; send control is 44px, disclosure 10px.
- Prior shared charts/context remain documented; latest two report drafts are now passed as untrusted revision context, with citation authority still tied to read sources.
