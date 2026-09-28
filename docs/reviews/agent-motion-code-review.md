# Grok motion review · 2026-09-28

Actual read-only verdict on the [initial snapshot](agent-motion-prompt.md). Tests were not run by Grok.

The motion layer does not rewrite the reducer, and it does not turn a stopped or failed turn into success. `agentActivity` still follows message and tool status only. The patch is still unsafe to land, because arrival completion is tied to an animation that quiet motion never runs.

**Arrival state never settles when motion is suppressed.** `is-arriving` is cleared only by `animationend` for `agent-paper-arrive`, by a change in `motion.reduced`, or by switching sessions. Under `data-motion=quiet` and `prefers-reduced-motion`, that 900ms animation is suppressed, so `animationend` does not fire. System reduced motion also disables the toggle, and the reset effect does not run again if the preference was already on. The id stays in `arrivingArtifacts`. The artifact is already in the message, but the arriving class remains for the rest of the page. If that class starts at opacity 0, the received result stays visually withheld.

**A cancelled arrive is replayed on an already delivered result.** The handler listens only on the open artifact panel. A newer artifact, or leaving the panel before 900ms, unmounts that node without `animationend`, so the id stays queued. Opening it again applies `is-arriving` and plays the arrival animation on a result that was already received.

**The saved pause preference is late.** `paused` and `systemReduced` both start false, and `data-motion` stays `on` until the effect. The system media query still suppresses CSS. A stored pause does not, so one frame of motion runs after load.

**`currentTurn` outlives the turn.** It is set when a send starts and cleared only in `selectSession`. Completion, failure, and an in-place stop do not clear it, so `is-current-turn` and the ritual stay up until the next send. The label still comes from status, so a real `stopped` message stays `interrupted`. Any loop bound to `is-current-turn` keeps running after the turn is over. If the existing stop leaves the assistant `running`, the ritual continues to show an active phase after abort.

**One copy mismatch:** a running `ask_user` tool is classified as `continuing`, whose text says the previous step already returned. `waiting` is only used once `status === 'waiting'` or `message.question` is set.

## Disposition

- Arrival cleanup now uses a bounded presentation timer independent of CSS events, and quiet-mode arrivals do not enter that queue. Data delivery and final task state do not depend on this timer.
- User selection of sources or report versions clears arrival presentation; a stopped animation cannot replay as a new result.
- Motion defaults to quiet until stored and OS preferences have been read.
- `currentTurn` intentionally retains a static final receipt until the next turn. Its CSS animations are one-shot. Infinite ornament loops are inside active-phase-only SVG groups; terminal phases contain none. Existing plan spinners are now also gated on running message status. Cancellation normalizes running tools in the existing reducer.
- A running ask_user now has a separate clarifying label that does not claim the previous step returned.
