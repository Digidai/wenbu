# Grok motion closure · 2026-09-28

Actual verdict on the [follow-up source snapshot](agent-motion-final-prompt.md). Scope: frontend state and cleanup, not CSS rendering or tests. Later visual refinements use the paper-and-pen mark while awaiting the next model step, twelve palaces for Zi Wei and three coins for I Ching; labels and state logic are unchanged. Those marks and the clarifying regression were added afterward and verified locally.

The four earlier defects are gone in this snapshot. I only read the code you pasted; I did not run tests, and I did not see the CSS file.

**Arrival cleanup** no longer depends on `animationend`. `is-arriving` is a presentation class. A 1000ms timeout clears the whole list, and that timer is cancelled on cleanup. Session changes, opening a result, panel and source switches, the version select, the motion toggle, and any change to `motion.reduced` all clear it immediately. Result delivery never waits on that class.

**Cancelling arrival does not replay it.** Clearing the list only removes `is-arriving`. The result node stays mounted under `key={artifact.id}`, so the class is not added again unless a later artifact event appends that id while motion is allowed. Opening a result and changing panels clear the list in the same update as the navigation.

**Motion preference cannot start late.** Until `ready` is true, `reduced` is true, so the first paint is `data-motion="quiet"` and artifact events do not enter `arrivingArtifacts` (`reducedMotionRef` is set during render). Stored pause and `prefers-reduced-motion` are applied in the same effect that sets `ready`. A later switch to motion-on does not retroactively mark artifacts that arrived while quiet.

**`ask_user` is not shown as a raw tool name.** A running `ask_user` maps to `clarifying` (“Preparing a question for you” / “正在整理需要你补充的信息”). Once `message.question` is set or status is `waiting`, the phase is `waiting` (“Add the requested detail to continue”), because that check runs before the tool lookup.
