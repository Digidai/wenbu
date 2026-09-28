# Agent generation motion · 2026-09-28

The independent Agent entry now uses a paper/ink motion language: a question lands, source pages move, calculation structures pulse, a pen marks continued work, and a received result arrives with a small seal and staggered structure. [Research](../research/agent-motion-2026-09-28.md) and [implementation design](../plans/2026-09-28-agent-motion-design.md) describe the rationale and event mapping.

## Truth and interaction

- Stages derive from actual received tool/message state; no scheduled fake stages, guessed percentages or fabricated symbols.
- Result text is visible immediately. A one-second presentation cleanup timer is independent of completion and data delivery.
- Pause affects animations only. It persists across reload. First paint stays quiet until preferences are read; the OS reduce-motion preference takes precedence.
- Error, cancellation, quota limits and clarification waiting stop active ornament loops. A finished-turn receipt says that the turn ended, not that every tool attempt succeeded. Existing raw errors and report-retry outcome annotations remain intact.
- Result/version/source navigation clears fresh-arrival presentation. Historical messages do not replay ceremonies. The original calculators, Agent transport, DeepSeek provider and validation guards are unchanged.

## Completed local checks

110 tests passed across eight files; Astro and Worker typecheck passed with zero errors/warnings; ESLint passed. Build: 65 HTML pages, 62 indexable pages, 2,735 internal references audited. No animation dependency was added.

`scripts/motion-preview.mjs` serves the actual built UI on loopback with **clearly labelled scripted SSE** and no model/API credentials. Four chart fixtures use public calculator responses with synthetic inputs. They are visual fixtures, not claims of model execution. Its playback schedule is only a local testing aid and is not part of production.

Browser checks on that controlled server:

- Consecutive computed transforms changed on the traveller and paper page, confirming continuous motion rather than a static screenshot.
- A mid-request pause set computed animation to `none` while the Stop generation control remained available. Resuming allowed the same request to complete.
- Report arrival used `agent-paper-arrive`; summary and section opacity were both `1` throughout the sampled arrival. Arrival markers and looping ornament nodes were absent at the settled state.
- BaZi pillars had 0/75/150/225ms offsets. Tarot cards had 0/75/150ms offsets. I Ching line 1 began at 0ms and line 6 at 250ms, matching bottom-to-top ordering. Twelve Zi Wei palaces remained readable with motion disabled.
- Reload retained pause and rendered zero live ceremony/arrival nodes for history. A new quiet-mode result arrived with no pending arrival marker. OS reduced motion was emulated through CDP and then reset; it selected quiet mode and disabled the motion toggle.
- Error and user Stop both showed unfinished content with zero active ornament nodes. Clarification showed waiting, not success. Selecting a historical report left zero arrival markers.
- Desktop 1280×800, mobile 390×844, Chinese and English inspected. Mobile document width was 390px during progress and result navigation. Inspected browser console had zero errors.

Screenshots: [opening](screenshots/motion-opening.png), [reading](screenshots/motion-reading.png), [writing](screenshots/motion-writing.png), [report](screenshots/motion-report.png), [I Ching](screenshots/motion-iching.png), [Zi Wei](screenshots/motion-ziwei-progress.png), [mobile reading](screenshots/motion-mobile-reading.png), [English mobile report](screenshots/motion-mobile-english.png). Images prove captured frames; the transform/state checks above separately cover changes over time.

## Grok review

The [first actual verdict](agent-motion-code-review.md) identified arrival cleanup tied to animation events, replay after navigation, late persisted motion preference and clarification copy. These were repaired. The [follow-up actual verdict](agent-motion-final-review.md) confirmed those defects were absent in the supplied final source snapshot. Grok did not inspect CSS or run tests; browser and deterministic verification are separate. Later visual refinements use the paper/pen symbol while awaiting the next step, twelve palaces for Zi Wei and three coins for I Ching. These marks and an additional clarification regression were added after that snapshot and checked locally.

## Deployment

The final Cloudflare Worker version is `2a088fc1-a1d8-4dfa-afbf-0e6465223ef4`, deployed to https://wenbu.genedai.me/agent/ with the existing account, domain and secrets. Its served Agent JavaScript and CSS match the local build byte for byte. Reloading the production page restored the saved report, retained the motion control and rendered zero historical ceremony nodes. [Machine-readable verification](agent-motion-verification.json) includes asset hashes and separates controlled playback from actual model execution.

The first motion deployment, `4a047ccb-4799-45d3-844a-62639f78232f`, passed [production smoke](live-smoke.json): 72 paths, four calculators and six MCP tools. A new, empty production conversation then asked DeepSeek to research midnight versus early-Zi day boundaries. It read four sources, completed seven tool steps and created the report “八字换日约定：零点换日与子初换日”. The provider reported `deepseek-flash` for the configured `deepseek-v4-flash` request. The final phase was `settled`, with zero looping ornament nodes, zero arrival markers and zero captured console errors.

The later deployment changes only the Zi Wei and I Ching decorative marks. Those final marks were inspected in the controlled browser; the production model call was not repeated for that visual-only refinement. Production captures: [opening](screenshots/motion-live-opening.png), [answer](screenshots/motion-live-answer.png), [result](screenshots/motion-live-result.png).
