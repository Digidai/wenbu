# Illustrated handbook release · 2026-09-30

## Product outcome

The previous 21-guide library had useful introductions and topic navigation, but most articles consisted of a handful of short prose sections. The release expands **every guide in Chinese and English** while preserving its URL, existing text, topic search, learning paths and cover artwork.

Each edition now adds a direct answer, three takeaways, an explained visual, comparison/reference table, a worked example, terminology, three FAQs and annotated source scope. The illustrations include Four Pillars, the generating/controlling cycles, ten-god relationships, interactive hexagram changes, all eight trigrams, actual tarot artwork and Zi Wei relationships. Practical guides use selected concept cards; the complete comparison appears in their table. Estimates of reading time now follow the localized text.

Examples use explicitly synthetic or selected inputs. The teaching hexagram is fixed at `[6,7,8,9,7,8]` (bottom first): 47 → 60, moving lines 1 and 4. Changing its controls updates only the diagram and announces that the written example stays fixed. It makes no random draw, saves no reading and invokes no model. The tarot illustrations show selected teaching cards, not a personal draw. Existing tarot reversal defaults are unchanged.

## Content and source review

Three content agents divided the 21 guides into BaZi (7), symbolic systems (7) and practical use (7), then performed cross-review. Corrections included Chinese table counts, figure/caption alignment, complete ten-god and BaZi/Western comparison dimensions, tarot image aspect ratio, teaching spread labels and responsive palace connectors.

Numerical fixtures were checked with the actual engines: 2005-12-23 08:37 Asia/Shanghai gives 乙酉 / 戊子 / 辛巳 / 壬辰; the solar-time example at 121.5°E is approximately +7.3 minutes. The 2024-02-04 noon/evening examples straddle Li Chun; lunar zodiac and solar-term year boundaries are kept separate. Zi Wei transformation descriptions preserve the current engine/output limits.

Sources distinguish historical conventions, calendar/time calculations, product implementation, published research and original editorial exercises. HKO, USNO and IANA are not presented as validating divination. NIST AI 600-1 supports verification practices, not a Wenbu quality certification. The existing Gutenberg source is the De Laurence edition; newly cited Waite texts use the actual Pictorial Key. No independent human subject-matter review or predictive validity is claimed.

## Search and agent access

- The server-rendered HTML contains the full content, real table markup, accessible diagram descriptions, stable section anchors and native FAQ disclosures. It remains readable without JavaScript.
- Article metadata includes source citations, actual content modification date and both alternate encodings. Canonical/hreflang and topic links remain intact; sitemap `lastmod` reflects article updates.
- `/knowledge/index.json` lists all 21 guides and both translations. Each edition has full `/knowledge/{zh|en}/{slug}.md` and `.json` representations generated from the same content.
- The JSON includes an outline, structured table/example/glossary/FAQ, source support scopes and canonical URLs. Markdown preserves all content and figure descriptions. Exports contain public editorial knowledge only.
- `read_library` no longer silently truncates at 9,000 characters. It returns `scope`, `section`, `truncated:false`, outline and export URLs. Optional section reads have independent citation IDs (`guide-<slug>#<section>`) and section URLs. Restoring two chapters preserves both receipts. Follow-up previews of a previously read full guide are explicitly partial and cannot authorize report citations until the Agent rereads the relevant content. External reference links are not treated as fetched.
- MCP resource `wenbu://knowledge`, CLI `library` / `guide`, the connection page, `SKILL.md` and `llms.txt` document discovery and reading. All these guide reads work without a model call or birth details.
- Cloudflare supplies Markdown/JSON MIME types and HTTP canonical links via four wildcard rules, so more guides do not consume a rule per file.

The editorial approach follows [Google's helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [AI search feature guidance](https://developers.google.com/search/docs/appearance/ai-features) and [Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article). Google does not require special AI text files or an AI-specific schema for its AI search features. The machine-readable exports serve actual agent workflows; they are not a promised ranking factor. Implementation quality, crawlability, indexing, citations and traffic are separate outcomes. No indexing/ranking/traffic result is asserted by this release.

## Verification

- Local: 196 tests pass across 16 files; Astro/Worker type checks, ESLint, build, site and art audits pass.
- Static checks cover 91 HTML pages / 84 indexable pages, all 78 tarot artworks and 42 complete HTML/Markdown/JSON guide editions. Knowledge checks verify content preservation beyond the former truncation threshold, source tails, valid section anchors, bilingual coverage and the actual MCP transport.
- Browser: all 42 article routes checked at 390 px and 1440 px (84 route/viewport checks), with no document overflow, missing diagrams/tables, broken loaded images or page errors. Selected figures inspected visually; interactive hexagram change/reset, native FAQ and table keyboard behavior checked separately.
- CLI and local Cloudflare: full JSON guide read and Markdown content type / canonical response header verified.
- Grok CLI: attempted read-only review with a bounded 160-second timeout. It returned no completed verdict; **not a passed Grok review**. Agent cross-review found and fixed two additional issues: section receipts previously overwrote one another, and follow-up source restoration silently dropped content. Regression checks cover both. Agent cross-review and executable checks are separate evidence.
- Production: deployed and verified at https://wenbu.app. See the receipt below. The release did not rerun paid DeepSeek conversations; mock-model harness regressions and live non-model MCP/CLI calls were checked separately.

Browser evidence: [route checks](browser-routes.json), [tarot on mobile](tarot-mobile.png), [Zi Wei on mobile](ziwei-mobile.png), [interactive I Ching](iching-desktop.png).

## Deployment receipt

- Source: `1116631582dc71609524d6149c861657fcec70f0` ([merged PR #2](https://github.com/Digidai/wenbu/pull/2)).
- Exact-source main CI: [36740529615](https://github.com/Digidai/wenbu/actions/runs/36740529615), success; PR CI [36740354112](https://github.com/Digidai/wenbu/actions/runs/36740354112), success.
- Cloudflare Worker version: `8805071f-73cc-4106-baf3-d47bb4a9bca9`, 100%; deployment `28b82332-df82-4df6-854f-158f41fd5810`, 2026-09-30 15:56:41 UTC. Domains remain wenbu.app / www.wenbu.app / wenbu.genedai.me. No database, archive or secret changes.
- [Live knowledge checks](live-knowledge.json): 42 editions / 85 resources (index + 84 full Markdown/JSON exports), byte-for-byte agreement with the local build, exact canonical headers and MIME types, MCP catalogue, distinct section receipts and unknown-guide 404.
- [Live site smoke](live-site.json): 94 pages/resources, four calculation APIs, six MCP tools and bilingual library reads passed.
- [Live browser checks](live-browser.json): Chinese BaZi, English interactive I Ching (change/reset) and English tarot at 390 px; all three tarot images fully decoded at 600×900, no horizontal overflow.
- Live captures: [BaZi](live-bazi.png), [I Ching](live-iching.png), [mobile tarot](live-tarot-mobile.png).
- GSC submission, actual indexing, search rankings, AI citations and traffic changes were not measured or claimed.
