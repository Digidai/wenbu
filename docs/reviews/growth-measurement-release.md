# Growth and measurement release · 2026-10-03

Status: implementation, CI, deployment, live reconciliation, GitHub Release and official MCP Registry publication verified. GitHub organization setup is prepared in an authenticated browser; the contact email and final Terms acceptance await the owner. A repository, submission receipt or local test does not establish traffic growth.

2026-10-03 follow-up: the owner has created `wenbu-app`. Organization branding, the repository transfer and integration version 1.3.1 are covered by the [organization launch record](organization-launch-2026-10-03.md). The earlier organization status and release receipts below remain historical evidence.

## Changes

- Single metric contract and calendar-range parser; confirmed-use browser IDs; audience cohorts and received-data quality checks; consistent overview/history dimensions and snapshot cutoffs.
- MCP tools/call terminal receipts cover calculations, library tools and SDK validation failures; one service count per invocation. Historical missing MCP receipts are not fabricated. CLI guide GET now respects native opt-out and test flags.
- Bilingual GitHub introduction, installable Skill folder, MCP manifest/config/examples, dependency-free CLI release archives with SHA-256, contribution guide and organization profile ready for publication.
- Bilingual first-connection article and visual MCP / CLI / Skill selection; canonical homepage, product topics and registered campaign/source vocabulary.

## Verification ledger

- Local: 282 tests in 21 suites; type checks, lint, build, 4,742 internal references, 78 cards, 42 full knowledge editions and 86 indexable URLs. No production data used in fixtures.
- Local UI: 390 / 1280 px, no horizontal overflow; inherited source/date/snapshot in history, compact expandable filters, custom-date labels, English integration card wrapping and logout.
- [PR #8](https://github.com/Digidai/wenbu/pull/8) merged as `d8a6f4d6858bdf512f4c1d478b969b79bea7a994`. [PR CI](https://github.com/Digidai/wenbu/actions/runs/37098011030) and [main CI](https://github.com/Digidai/wenbu/actions/runs/37098117436) passed.
- Initial Worker version `72eda863-f27c-4183-9ad9-bb61bee33959`: production shell/asset bytes match for Chinese/English Agents, the new article and Insights. The original checkout's unrelated drafts are preserved.
- [Read-only report reconciliation](growth-trends-live.json): all presets, calendar boundaries, dense buckets, additive totals, dimension filters and invalid-query rejection passed.
- [Runtime verification](growth-runtime-live.json): public domain proof served exactly. Three synthetic MCP calls produce three enclosing terminal receipts plus one calculation phase. `test:false` context cannot override the forced test header, and ordinary history excludes these records.
- [GitHub v1.3.0 Release](https://github.com/Digidai/wenbu/releases/tag/v1.3.0): CLI, MCP and Skill archives plus SHA256SUMS are public. GitHub's uploaded asset digests match the locally built archives. The fixed-lines CLI also passed against production with telemetry off. No npm publication is claimed.
- [Official MCP Registry entry](https://registry.modelcontextprotocol.io/v0.1/servers/app.wenbu%2Fmcp/versions/1.3.0): domain-authenticated `app.wenbu/mcp`, version 1.3.0, public remote URL and branded icon. [Read-back receipt](growth-registry-live.json) verifies metadata retrieval. The registry is currently preview; publication is not an installation or adoption claim.
- IndexNow: the deployed manifest matched; the provider returned HTTP 429 for 86 URLs, with 0 received and 86 pending. Cloudflare's existing cron retries after the stored backoff. This is not an accepted submission or indexing result.
- Organization: `wenbu` belongs to another GitHub user; `wenbu-app` returned 404 when checked. The free-plan form is filled in the owner's authenticated browser with `wenbu-app` and personal ownership by Digidai. Contact email and final Terms acceptance await the owner; nothing has been submitted. Profile is prepared in `community/profile/README.md`; no nonexistent organization link is published.
- Grok: read-only CLI review returned HTTP 402, usage balance exhausted. No verdict was produced. Clarity project tag GET returned HTTP 200; dashboard-side collection remains unverified. No incremental traffic, search index status or rankings have been claimed.

## Metadata follow-up

Public health and MCP metadata read the application version from package.json; health also reports the measurement contract version. This removes a stale health version string without changing the calculation API.

[PR #9](https://github.com/Digidai/wenbu/pull/9) merged as `0ba13f02723847ee3c039e7408d49835ca27d46e`; [PR CI](https://github.com/Digidai/wenbu/actions/runs/37099015873) and [main CI](https://github.com/Digidai/wenbu/actions/runs/37099134032) passed. Worker version `864988fa-5755-4ed6-bc21-b306af9872bb` serves health and MCP version 1.3.0 and measurement version `2026-10-03-v2`. [Live metadata check](growth-metadata-live.json) passed with telemetry off. The v1.3.0 archives remain built from their original release tag; this follow-up changes runtime metadata and evidence only.

## Boundaries

The analytics store excludes prompts, birth inputs, chart contents, private messages and raw IP addresses. Browser IDs and UA hints do not prove natural-person identity. Quality checks describe records actually received, not all missing traffic. Browser counts deduplicate over the complete filter range and cannot be summed across buckets. Clarity provider-side ingestion remains a separate check.

References: [growth plan](../growth/2026-10-03-launch.md), [analytics contract and privacy](../analytics.md), [integration quickstarts](../../integrations/README.md).
