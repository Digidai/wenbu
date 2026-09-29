No blocking defects.

The `@supports` rule only changes browsers that implement subgrid, and `grid-row: span 5` with `grid-template-rows: subgrid` matches the five in-flow boxes: eyebrow, face button, title, orientation, keywords. A closed dialog generates no box. An open modal dialog is `position: fixed` in the top layer, so it is out of flow and does not become a sixth grid item or shift the rows beneath the opened card.

`min-width: 0` lets the English title wrap inside the shared title track, so a two-line title grows that track for every card and the orientation and keyword rows stay aligned. `row-gap: 0` is the right axis: subgrid uses the parent’s row gap between those tracks, and the longer `.agent-chart .tarot-result .drawn-cards` selector still beats a later `gap: 8px` from `agent.css`. Column gap is untouched. The focus outline now uses a defined color.
