# Agent report recovery — 2026-10-01

## Incident and cause

The reported turn showed a rejected `write_report`, two successful **library** reads, then a saved report, but still said “1 次未成功”. Long handbook documents restored only previews; prior-report preparation covered external references only. The model could reuse citation IDs before reading the full library text. The citation guard correctly rejected that draft.

Two presentation defects compounded this: legacy recovery detection accepted only `read_reference`, and the trace summary counted every historical error even if the report had been repaired. The screenshot also contained an empty “三点提要：” conclusion.

A real DeepSeek test found a second reproducible class: English report arguments repeatedly failed structure/length validation. The model received only a generic error and made three unsuccessful writes. See the initial local evidence JSON. Do not interpret this test failure as an initial successful verification.

## Changes

- Pre-read up to three exact, known prior-report citations, including long library articles and scoped sections. Replace previews with full tool-read content; no client receipt grants external authority.
- Return structured missing citation IDs and bounded field validation errors to the model. Keep schema and citation checks strict.
- Allow at most two directed report repair calls and three additional source reads, within the existing five-model-call / twelve-tool-call / 120-second turn limits and shared quota. Failed web reads remain failures. Unknown IDs never become arbitrary URLs.
- Reconsider the rejected draft with the newly read evidence. Do not automatically save the original draft or silently strip its citations. On success, link each rejected attempt to the exact completed replacement tool and artifact.
- Keep unsuccessful attempts in history; display explicitly recovered ones neutrally. Preserve unrelated errors and later transport failures. Recognize the older unambiguous library-read sequence without rewriting stored records.
- Replace recognizable empty closing headings using the saved report summary only after successful transport validation. Incomplete SSE remains an error.

## Verification

- `npm run verify`: 240 tests across 18 suites; type checks; 91-page build; site/art/knowledge/IndexNow audits passed.
- `npm run lint`: passed.
- Real local DeepSeek, synthetic drafts: Chinese succeeded on the first report write. After the format-repair fix, English recovered a rejected draft, saved its replacement, and completed in four model calls/six tools. Requested model: `deepseek-v4-flash`; upstream-reported model: `deepseek-flash`.
- Playwright, synthetic local-history fixtures: Chinese and English at 390 and 1440 pixels; historical recovery status, expandable attempt details, remaining independent failure, and horizontal-overflow checks passed. Screenshots inspected.
- Grok CLI was invoked read-only with the relevant source and diff. It timed out after 180 seconds without a review verdict; this is not a passed Grok review.

## Release

Production deployment and live checks are recorded after release. Local checks alone do not establish deployment or production behavior. These safeguards cover the reproduced failures; external providers, network interruptions, and future invalid model outputs can still fail and must remain visible.
