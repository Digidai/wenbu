# Agent visual notebook · 2026-09-28

[Design](../plans/2026-09-28-agent-visual-notebook-design.md) · [Asset receipt](agent-visuals-assets.json) · [Actual exported report](agent-visuals-live-export.md)

## Delivered behavior

Six original SVG instrument marks, an illustrated empty result desk, shorter starter cards, and a compact execution disclosure replace repeated text and generic symbols. Failure/stop counts remain visible even when the raw activity is collapsed; new exceptions open the log, and a manual collapse is respected afterward.

Report diagrams appear before the full overview. DeepSeek's `write_report` can supply one bounded semantic comparison or ordered sequence with per-item citations. Selecting an item exposes its evidence. Two-column comparisons stack at 360px and below; a third item spans the row. Sections can be opened individually or all at once. Source excerpts are expandable. Short motion marks diagram arrival, chapter opening and icon hover; the existing pause and system preference still govern the entire workspace. No animation library or new dependency was added.

Older reports remain readable without invented diagrams. Visual data survives report revision and Markdown export. Diagram-only references receive the same validation/re-reading as section references. The public schema, OpenAPI and protocol document the optional field. Generated text is not executable markup, and the renderer introduces no probability, confidence or fortune scores.

## Local verification

117 tests passed across nine files. Astro and Worker TypeScript: zero errors, warnings and hints. ESLint, production build and site audit passed: 65 HTML pages, 62 indexable pages, 2,735 internal references. New regressions cover bounded diagrams, legacy reports, unread diagram citations, diagram-only reference revalidation, export escaping, unresolved section citations and retained revision context.

Controlled UI checks used `scripts/motion-preview.mjs` on loopback with clearly labeled synthetic SSE, no provider calls, and the actual built application:

- Desktop entry at 1280px: all four instrument cards visible; new exploration starts at scroll position zero.
- Chinese comparison and English ordered steps at 390px: no horizontal document overflow. At 320px comparison items used one 248px column, with document width/scroll width both 320px.
- Keyboard Enter selects a comparison item and opens a chapter. Expand all opened both fixture sections; collapse all and opening just the second gave `[false,true]`, with focus on the summary. Source excerpts opened with their full received text.
- Selecting the third step then switching to a two-item report reset selection to its first item and restored the default first chapter without errors.
- A source failure remained `interrupted`, displayed one failed attempt, and opened the trace. After manual collapse, editing an unsent draft did not reopen it.
- During diagram arrival the first card had `ritual-section-in`, transform `matrix(1,0,0,1,0,2.1679)`, opacity `1`; after the presentation window it had no animation/transform and still opacity `1`. In quiet mode chapter content also had no animation and opacity `1`.
- Captured browser console errors: zero. The previously verified system reduced-motion control is unchanged; this iteration directly rechecked the manual quiet state.

Local captures: [entry](screenshots/visual-desktop-entry.png), [comparison at 390px](screenshots/visual-mobile-comparison.png), [English steps](screenshots/visual-mobile-steps.png). The mobile fixture captures predate the final diagram-before-summary ordering; the diagram controls and responsive layouts were checked independently. Final production assets match the local build.

## Actual Grok review

The [first review](agent-visuals-review.md) and [follow-up](agent-visuals-final-review.md) returned actual CLI verdicts. Export fidelity, per-item and per-section source association, unresolved source labeling, sequence accessibility and optional-data normalization were repaired. The second review also identified older plain-text export/appendix defects, now covered by a regression. The alleged cross-report state leak was already prevented by the enclosing artifact key; explicit component keys and a selected-index fallback strengthen that boundary. Reviews were source-only and are not browser/test evidence. Final diagram ordering and prompt wording were polished after those snapshots and checked in production.

## Production verification

Initial visual deployment: `b811ccb8-5d98-4c1d-8960-99cc817dc66f`. [Production smoke](live-smoke.json) passed 72 paths, all four calculators and the six MCP tools on that deployment; it made no model request.

Final deployment: `929c08bf-681e-4579-bb49-bd8687c184a5`, served at https://wenbu.genedai.me/agent/. JavaScript, both CSS assets, public request schema and protocol matched the final local build byte for byte.

A new empty production session asked DeepSeek to compare midnight and early-Zi day conventions. It completed five tool calls (two searches, two reads, one report) and produced a sourced comparison. The final deployment then revised that report through a real follow-up: one successful report tool, two retained report versions, two comparison items, three chapters and two resolved cited sources. The configured request was `deepseek-v4-flash`; the provider reported `deepseek-flash`. The final phase was `settled`, with no captured console errors. This verifies generation and revision mechanics, not scientific validation of the report's subject.

The second diagram item was selected in the production browser and displayed its two evidence links. The Markdown export was downloaded once. IAB's download-event waiter timed out, but the native download was found in Downloads with the expected report title and current timestamp; its five item/section citation groups were verified and copied to [the export evidence](agent-visuals-live-export.md). The original user download remains untouched.

[Final production screenshot](screenshots/visual-live-report.png) shows the revised diagram, evidence selector, compact process and retained answer. The attempted second production mobile resize did not change that tab's viewport; no production-mobile claim is made from it. Responsive checks above use the actual local build, whose live assets were matched. Temporary viewport overrides were reset and the local preview tab was closed.
