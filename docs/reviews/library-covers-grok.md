The list view breaks search. One high-severity regression, one medium accessibility bug. No other blockers in this patch.

### High — list view shows guides the search has excluded

**Source:** `src/styles/library.css` (`.knowledge-library[data-view='list'] .library-guide` versus `.library-guide[hidden]`)

**Evidence:** Filtering sets `hidden` on each `[data-guide]` that fails the topic and search test. `.library-guide[hidden] { display: none }` is `(0, 2, 0)`. The list rule is `(0, 3, 0)` and comes later, so it wins with `display: grid`. A section stays visible whenever at least one guide matches, and every non-matching guide in that section is painted again. The status line still uses the JavaScript `count`, so “3 guides found” can sit above a full topic. Topic-only filtering still works, because the whole `.library-topic[hidden]` is not overridden. Cover view still works, because `.library-guide { display: flex }` is only `(0, 1, 0)`.

**Repair:** Keep the hidden rule stronger than the list layout:

```css
.knowledge-library[data-view='list'] .library-guide[hidden] {
  display: none;
}
```

### Medium — the result count is announced on load and on every keystroke

**Source:** `src/components/KnowledgeLibrary.astro` (`apply` writes `.library-search-status`; `input` calls `apply`)

**Evidence:** The status node is `aria-live="polite"` and `aria-atomic="true"`. `apply()` runs once at startup and again on every `input` event, and it always assigns `textContent`. A screen reader hears “找到 21 篇指南” / “21 guides found” when the controls appear, then again for each character that changes the count.

**Repair:** Write the status only after a short pause, and only when `count` actually changes. Leave the first paint empty so load does not announce.

Motifs check out: 12 palace cells, 8 distinct trigrams, 6 hexagram lines, 4 pillars, 10 relation nodes, 4 transformation nodes, and a point-up pentagram. Tarot uses the six named thumbnails with empty `alt`, dimensions, and `lazy` inside `aria-hidden`. Cover ratio is `15/8`; the catalogue is 3, then 2, then 1 column, and list stays one column. No-JS leaves the controls hidden and all covers visible. View state is only `data-view` on the root.
