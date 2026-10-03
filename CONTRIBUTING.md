# Contributing to Wenbu

Help make the calculations reproducible, explanations readable, and tools useful in Chinese and English. The project is MIT licensed; dependency and image provenance are documented separately.

## Before proposing a change

- Reproduce the problem with a synthetic input. Never put real birth details, private messages, feedback exports or credentials in a public issue.
- For a calculation disagreement, include the date convention, time zone, day boundary, library version and an independently checkable reference. A different traditional school is not automatically a software defect.
- For content, distinguish calculation facts, traditional interpretation and evidence about real-world claims. Cite the exact source and the part it supports.
- For integrations, preserve request limits, explicit selected context, and the distinction between search metadata and content actually read.

## Development

Node.js 22.12 or later:

```sh
npm ci
npm run verify
npm run lint
npm run preview
```

Astro development alone does not serve the Worker API. Rebuild for Worker preview. Changes to analytics need tests for the event grain, deduplication, filters, test exclusion and private-data boundaries, not only UI snapshots.

## Integration releases

`public/wenbu.mjs` is the canonical CLI. `public/SKILL.md` and `skills/wenbu/SKILL.md` must be identical so the website and skill installers receive the same instructions. MCP runs from `worker/mcp.ts`; `integrations/mcp/server.json` describes its public remote transport.

```sh
node scripts/build-integrations.mjs --out /tmp/wenbu-new-release
```

The destination must not already exist. Inspect the archives and checksums, validate examples against a local Worker, pass CI, then deploy and verify the remote endpoint before publishing registry metadata. Do not publish npm packages or registry versions merely because local packing succeeded.

## Security and private data

Report a security issue privately to the maintainer through the repository owner's public contact channel. Do not disclose keys, private analytics or exploit payloads in a public issue. Production data is not test-fixture material; use `X-Wenbu-Test: true` for controlled validation and respect analytics opt-outs.
