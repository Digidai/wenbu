Prior findings hold. One concrete layout defect remains.
**Confirmed**
- `agent-motion.css` still ends with `data-motion="quiet"` and `prefers-reduced-motion: reduce` rules that zero animation, transition, and scroll behavior on `.agent-workspace` descendants and `::before` / `::after`. The new receipt, check, notice, and dialog animations sit above those rules and are covered.
- Instrument links are the four fixed labels 八字 / BaZi, 易经 / I Ching, 塔罗 / Tarot, 紫微 / Zi Wei. `.agent-instruments a > svg:last-child { display: none }` drops the trailing arrow; `white-space: nowrap` still fits those strings in the 184–218px sidebar.
- Notice restart is `key={notice}` on the inner text node. Context save sets `focusAfterContext` and calls `textarea.focus()` only after `dialog.close()` in the `contextOpen` effect.
- `.reading-saved-note` has no negative margin (`margin: 10px 0 16px`).
**Defect**
- `.reading-saved-note:empty { display: none }` never matches. The `<p>` in `ToolDesk.tsx` always contains the newline/indent text nodes around `{saved && …}`, and CSS `:empty` treats whitespace as content. The “hidden until saved” rule and `:not(:empty)` animation therefore fail on every result: the status line keeps its margin and a line box between the action row and the export / interpretation block before anything is saved.
