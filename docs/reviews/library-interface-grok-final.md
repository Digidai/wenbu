No blocking defects in the pasted library patch.

The mobile search input uses `flex: 1 1 160px` and `width: auto` at `max-width: 640px` in `src/styles/library.css`, with the base `min-width: 0` still in effect. The guide search text includes `slug` with hyphens turned into spaces, so “reversals” matches `tarot-reversals`. Below 960px, `.article-aside` is `display: none` and `.article-mobile-toc` is `display: block`. I did not run a browser check.
