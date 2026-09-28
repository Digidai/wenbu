# Grok visual notebook closure · 2026-09-28

Actual source-only follow-up on [the closure snapshot](agent-visuals-final-prompt.md). The two remaining export findings also affected the earlier text-only export. Both were repaired after this verdict: all plain-text fields and appendix links now use escaping, Markdown section bodies retain intentional formatting, and sections include their own resolved or missing citations. A regression covers literal headings, special characters in source links and an unresolved section citation. This verdict is not a test or browser result.

## Verbatim verdict

Source-only review of the four snippets. No tests or browser checks. Parent `key`, context-map `readReportVisual`, and the ≤360px stack are outside these files.

Two export gaps are still real:

1. **Appendix links are still raw.** Per-item citations go through `markdownCitation`, but the closing list is still `` `[${s.title}](${s.url})` ``. A `]` in the title or a `)` in the URL breaks that link. Title, summary, section headings, and follow-up questions are also still inserted unescaped, so a newline or `#` in those plain-text fields splits the document. Visual label, detail, title, and note are escaped.

2. **Unresolved section citations disappear.** Visual items print `Unresolved citation / 引用未匹配` per id. Section `sourceIds` only contribute to `reportSourceIds`, and the appendix drops any id that does not match a source. Matched section sources are not repeated under that section.
