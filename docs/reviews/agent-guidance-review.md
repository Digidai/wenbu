Blocking defect: suggestion staging can rewrite free text or report success without inserting anything. Two more issues are real but non-blocking.
## Blocking
**1. `stageSuggestion` matches substrings and replaces the first hit** — `src/lib/agent-guidance.ts` lines 223–227, used by `prepareDraft` in `src/components/AgentWorkspace.tsx` (diff around the new `prepareDraft`).
`draft.includes(previous)` / `includes(next)` plus `replace` (first match only) does not target the intact inserted suggestion.
Reproduction:
1. Type `我想比较两个选择的利弊` and choose the suggestion `比较两个选择`.
2. `includes(next)` is true, so the draft is unchanged, but `onStage` still returns true. The chip shows pressed, the hint says it was added, and `suggestion_selected` is tracked.
3. Choose another option, e.g. `找到卡住的地方`. The previous string is a substring of the typed sentence, so `replace` rewrites that sentence and never appends a separate suggestion.
Same failure if an earlier paragraph contains the previous option and the real suggestion sits at the end: the paragraph changes and the old suggestion stays. Send then treats `value.includes(staged text)` as that action (`AgentWorkspace` `agent_started` tracking), so analytics can label a send the user never staged.
## Non-blocking
**2. Medium, accessibility.** `src/styles/agent-guidance.css` (`.agent-guide-question h2:focus { outline: none; }`) and `AgentOnboarding.tsx` step effect (`heading.current?.focus()`). Each step move focuses the heading and suppresses the outline, so keyboard focus has no visible indicator.
**3. Medium, analytics.** Starters now call `prepareDraft(..., 'example')`. The existing funnel counts `agent_started` only when `action != 'example'`. An unchanged example send is omitted from both the activation funnel and the guidance table. Edit the starter until that string is gone and it counts as a normal start.
**4. Low, layout.** `.agent-guide-progress li + li { margin-left: auto; }` gives every step after the first an auto margin. In a row, only the first auto margin takes free space, so step 1 sits on the left and steps 2–3 clump on the right.
Guided topic → aim → optional context, no send until the composer sends, latest-message-only clarification, completion follow-ups, and guidance events (step/action/mode, not topic or answer text) match the source. The DeepSeek tool loop is only an added instruction plus trimmed non-empty `ask_user` options.
Blocking defects found.
