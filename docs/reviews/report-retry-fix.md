# Report revision retry fix

Verified on 2026-09-28 at https://wenbu.genedai.me/agent/. The user's screenshot showed a failed report attempt still labelled “未完成” above the successfully saved report. The earlier acceptance counted the final artifact as success and missed the avoidable failure and misleading overall impression.

## Cause and change

Prior drafts carried external citation IDs, but external content had not been re-read in the next turn. The first `write_report` therefore failed the correct source-validation guard. DeepSeek then read the reference and successfully retried. The UI displayed the first error as if it were the current outcome.

The harness now actually re-reads up to three known catalogue references from supplied report drafts, latest draft first, before the first model call. Fresh content enters the model context; the reads remain subject to the existing 12-tool and 120-second limits. Failed reads confer no authority. Unknown client IDs cannot trigger arbitrary fetches. Source validation remains enforced.

For the narrow historical sequence observed here—citation rejection, successful reference read, one later report—the UI labels the first item “报告整理 · 早先尝试 / 后续已生成报告”. Expanding it explains the sequence and retains the original failure. Stored and exported status remains `error`; unrelated failures remain visible. It does not relabel the failed attempt as successful.

## Verification

- Local: 106 tests, Astro/Worker typecheck and lint passed. Regression cases cover fresh evidence before the first model request, failed reads, invented IDs, the three-reference cap, cancellation during preparation, honest historical status and unrelated errors. Build: 65 HTML pages, 62 indexable pages, 2,735 internal references audited.
- GitHub CI: implementation commit `25eefcc6a129b6f5479da91e277d9e1b542af5cc` passed the clean-install, verification and lint workflow: https://github.com/Digidai/wenbu/actions/runs/36414399271.
- Cloudflare: deployed Worker `b54b3f90-64d9-46df-aca1-e06eeb236731` with existing domain and secrets.
- Original production browser session: the exact old failed attempt now shows the later outcome and retains its raw error. Its exported JSON confirms the raw status was not changed.
- Real DeepSeek production follow-up: `read_reference` completed before a single successful `write_report`; final status was `complete`. The report “真太阳时：简明说明” is the third retained version. Provider reported `deepseek-flash`. This is actual browser and downloaded-JSON evidence, not a mocked model run.
- Public regression: 72 paths, all four calculators and six advertised MCP tools passed the [live smoke checks](live-smoke.json). No model request is included in that separate smoke script.
- Browser: desktop 1280×800 and mobile 390×844 inspected; mobile document/body widths both 390px. No errors in the inspected production console.

Evidence: [machine-readable verification](report-retry-live.json), [original history after correction](screenshots/report-retry-history.png), [new successful revision](screenshots/report-retry-fixed.png), [mobile history](screenshots/report-retry-mobile.png).

## Grok review

The focused read-only Grok CLI invocation returned no verdict after approximately 15 minutes. A smaller, verbatim source-only retry also returned no verdict during its approximately two-minute overlapping run. Both were interrupted on 2026-09-28 at 11:17 UTC rather than left running. Logs contained startup warnings but establish no cause for the missing response.

Inputs are retained as the [initial patch snapshot](report-retry-fix-prompt.md) and [final implementation snapshot](report-retry-verbatim-prompt.md). The second includes the small catalogue-ID set optimization and newest-draft prioritization. Raw CLI logs remain local and ignored. **Grok review of this fix is unverified, not passed.** The completed deterministic, CI and real production checks above are separate evidence.
