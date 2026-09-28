# Grok visual notebook review · 2026-09-28

Actual read-only CLI verdict on [this snapshot](agent-visuals-prompt.md). It inspected supplied source; it did not execute tests or inspect the browser.

## Disposition

- Fixed Markdown fidelity: plain diagram strings are escaped, newlines flattened, and each item's sources exported with that item.
- Fixed missing-source labeling: unresolved citations are now distinguished from an empty citation list, including partial matches.
- Added explicit step numbering to accessible names and polite announcement of evidence selection.
- Normalized optional diagram data before sending it as follow-up context, matching display/export behavior.
- Increased small diagram labels; comparison items stack at 360px and below. The tested 390px layout retains a readable side-by-side comparison.
- The claim that React reapplies an unchanged details open prop on every render is not accurate. Nevertheless, disclosure intent now has explicit state; only a newly observed failure/stop forces it open, and the user can collapse it afterward.
- The claimed cross-report state leak was already prevented by the enclosing key={artifact.id}. An explicit component key and a selected-index fallback were added for clarity and defensive rendering. Browser version-switch checks are recorded separately.
- No test or browser result is inferred from this review. A later closure snapshot and independent checks follow.

## Verbatim verdict

The diagram schema and the unread-citation check are sound. These are the concrete defects in the UI, export, and follow-up path.

**High — `AgentTrace`:** `open={failed > 0 || stopped > 0}` is reapplied on every parent render. While a turn is streaming, opening the log snaps it shut again; while any tool is failed or stopped, collapsing it snaps it open again. Use `defaultOpen` for the initial failure case, or drive `open` only when the failure or stopped count changes.

**High — `ReportDiagram` / `AgentReport`:** `selected` and `expanded` are local state with no key on `report.id`. The results pane reuses one `AgentReport` across reports, so a selected index from a 4-item diagram survives onto a shorter one and `visual.items[selected].label` throws. Chapter open state leaks the same way, and `allExpanded` compares `expanded.length` with the new section count, so the control label is wrong. Reset both when `report.id` changes, and clamp `selected`.

**Medium — `artifactMarkdown`:** Diagram lines are raw `` `${index + 1}. **${item.label}**: ${item.detail}` `` plus an unescaped `note` and `## ${visual.title}`. Newlines or Markdown in those bounded strings break the list and headings. Item `sourceIds` are also dropped; only the flat report-level link list remains, so a downloaded note no longer shows which step or alternative a source supports. Escape the plain-text fields and print each item’s resolved citations.

**Medium — `Citations`:** Empty `sourceIds` and ids missing from `sources` share one string (“本项未附来源” / “No source attached”). A diagram item that cited something the pane cannot resolve looks like an honest unsourced claim. Keep the empty case, and for unresolved ids say the citation did not match a read source.

**Medium — `ReportDiagram`:** Step numbers sit in `aria-hidden`, so the sequence is only implied by button order. The evidence node updates from `aria-pressed` with no `aria-live`, so the newly shown citations are not announced. Put the step index in the button name and mark the evidence region live.

**Medium — `AgentWorkspace` context map:** Display and Markdown use `readReportVisual`, which drops a bad `visual`. The next request forwards `artifact.visual` raw into `agentRequestSchema`. A stored diagram that fails the current strict schema (null, extra field, oversize) fails the whole follow-up turn. Send `readReportVisual(visual)` instead.

**Low — `agent-visuals.css`:** `.diagram-comparison .diagram-items` stays two columns at `max-width: 600px`, with the kind badge at 7px and “查看依据” at 8px. Stack comparison items in that breakpoint and raise those labels.
