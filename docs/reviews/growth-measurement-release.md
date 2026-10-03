# Growth and measurement release · 2026-10-03

Status: local implementation complete; release evidence is recorded below as each stage is verified. A repository, submission receipt or local test does not establish traffic growth.

## Changes

- Single metric contract and calendar-range parser; confirmed-use browser IDs; audience cohorts and received-data quality checks; consistent overview/history dimensions and snapshot cutoffs.
- MCP tools/call terminal receipts cover calculations, library tools and SDK validation failures; one service count per invocation. Historical missing MCP receipts are not fabricated. CLI guide GET now respects native opt-out and test flags.
- Bilingual GitHub introduction, installable Skill folder, MCP manifest/config/examples, dependency-free CLI release archives with SHA-256, contribution guide and organization profile ready for publication.
- Bilingual first-connection article and visual MCP / CLI / Skill selection; canonical homepage, product topics and registered campaign/source vocabulary.

## Verification ledger

Local gates passed: 282 tests in 21 suites, Astro/Worker type checks, lint, production build, 4,742 internal references, 78 cards, 42 complete knowledge editions and 86 indexable URLs. Local Worker UI at 390 and 1280 px used synthetic fixtures, with no horizontal overflow; overview source/date/snapshot carried into history and English integration cards wrapped. PR #8 CI must pass again after the QA-marker fix. Deployment, served-asset checks, production reconciliation, Release and Registry remain pending. Grok CLI returned HTTP 402 (usage balance exhausted), not a review verdict. The Clarity project tag GET returned HTTP 200; provider-side collection has not been verified. Organization creation requires the signed-in GitHub UI. No search indexing or incremental user growth has been verified.

## Boundaries

The analytics store excludes prompts, birth inputs, chart contents, private messages and raw IP addresses. Browser IDs and UA hints do not prove natural-person identity. Quality checks describe records actually received, not all missing traffic. Browser counts deduplicate over the complete filter range and cannot be summed across buckets. Clarity provider-side ingestion remains a separate check.

References: [growth plan](../growth/2026-10-03-launch.md), [analytics contract and privacy](../analytics.md), [integration quickstarts](../../integrations/README.md).
