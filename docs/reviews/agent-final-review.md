# Grok CLI closure of focused defects · 2026-09-28

Actual read-only verdict from the source excerpts in `agent-final-review-prompt.md`. This closes the three identified defects; the later report-budget reservation and text/animation polish were validated with tests and live browser acceptance, not claimed as part of this Grok excerpt review.

All three are fixed. Nothing in these excerpts is still open. This is inspection only; I did not run tests.

**Redraw authorization is fixed.** After trim and trailing punctuation are removed, a new draw is authorized only when the whole message is an allowlisted command: anchored Chinese forms such as `重新抽` / `重抽` / `再抽` and `重新起卦` / `再起一卦` / `重起一卦`, or the anchored English forms (`redraw`, `recast`, `draw again`, `draw another card`, and the listed `cast` / `please` variants). A refusal, quotation, hypothetical, or longer sentence does not match, so those requests keep the prior cards. `newDraw: true` stays a separate explicit API signal.

**Quota copy is fixed.** `daily_allowance`, including a nullish reason defaulted to that code, is the network daily-turn 429, reset at Shanghai midnight, with history and tools still available. Any other reason is the shared site-budget 429, and the Chinese text says this is not a personal turn shortage.

**Tool-result coverage is fixed.** If the batch contains `ask_user`, every other call is not executed and still gets a tool message for its id; only `ask_user` runs. That call still gets a result on success, on Zod or other tool failure, and when the tool budget is already spent. An aborted turn throws rather than issuing another model request.
