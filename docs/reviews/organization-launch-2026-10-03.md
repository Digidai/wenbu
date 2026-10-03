# Wenbu GitHub organization and integration release

Date: 2026-10-03. The owner created the organization and authorized completion in this chat. Status: organization branding and profile, repository transfer, CI, release archives, Cloudflare deployment, production integration checks and official MCP Registry read-back verified.

## Ownership and preservation

- Organization: [wenbu-app](https://github.com/wenbu-app); authenticated Digidai membership is active and its role is admin.
- Repository: [wenbu-app/wenbu](https://github.com/wenbu-app/wenbu). Repository ID `1392270977` is unchanged; the transfer baseline is `69532f2915326dbf751dd1b2c6ad3d869307e081`. Public visibility and the main branch are retained.
- The v1.3.0 archives remain historical releases. Source links in current website content, integration documentation and new packages use the organization URL; old review receipts remain original evidence.
- Organization name, bilingual description and `https://wenbu.app` website are set. `community/profile/README.md` is the maintained source for the public `.github/profile/README.md`.
- The website brand mark is the organization avatar. GitHub confirmed the avatar update and saved the main repository pin; both are visible in the public overview. The bilingual profile is published in [wenbu-app/.github](https://github.com/wenbu-app/.github), commit `aede3a67574cb23fc00e3e0277c7c73d5b26499f`; its downloaded contents match the maintained source exactly.
- [Transfer preservation receipt](organization-transfer-live.json): repository identity, public visibility, main commit and v1.3.0 asset IDs, names, sizes and digests were preserved.

## Integration update

Version 1.3.1 updates source ownership metadata in the CLI package and official MCP Registry manifest. Current website source links, the bilingual first-connection article and `llms.txt` use the organization address. The calculation routes and remote `https://wenbu.app/mcp` endpoint are unchanged. The latest-entry Registry link is stable across future versions.

## Verification ledger

- Local: 282 tests in 21 suites, type checks, lint and build passed. Site checks covered 4,742 internal references, 86 indexable URLs, 78 cards and 42 full knowledge editions.
- [PR #10](https://github.com/wenbu-app/wenbu/pull/10) merged as `582d79884ab3cd24a397b8375e3f81ea21de347b`. [PR CI](https://github.com/wenbu-app/wenbu/actions/runs/37101445587) and [main CI](https://github.com/wenbu-app/wenbu/actions/runs/37101637231) passed.
- Existing Cloudflare OAuth was verified before publication. Worker `wenbu` version `2beaca2b-2f69-4da0-91bf-83aa9beeebfe` serves runtime version 1.3.1 and measurement version `2026-10-03-v2`. Production publishing was a verified local Wrangler deployment; GitHub CI is a separate quality gate.
- [Production receipt](organization-runtime-live.json): Chinese/English Agents and first-connection article HTML shells match the built output; seven referenced assets/domain-proof files match byte for byte. New organization links are present, old source links are absent on the checked pages. MCP initialization reports 1.3.1, six tools are listed, and both MCP and CLI fixed-line calculations return hexagram 1. Every Wenbu verification request used test and analytics-off flags.
- [Release v1.3.1](https://github.com/wenbu-app/wenbu/releases/tag/v1.3.1) targets the merged source. CLI, MCP and Skill archives plus SHA256SUMS are public; all four uploaded asset digests match the local files. The older v1.3.0 release remains intact. No npm publication is claimed.
- [Official MCP Registry v1.3.1](https://registry.modelcontextprotocol.io/v0.1/servers/app.wenbu%2Fmcp/versions/1.3.1) was published after renewing the existing domain-authenticated login. [Read-back receipt](organization-registry-live.json) verifies the new repository, unchanged remote URL, version and latest-entry resolution. Historical v1.3.0 metadata remains immutable.
- IndexNow's post-deploy hook respected the existing HTTP 429 backoff: zero new submissions in this run. The deployed content manifest is checked by the existing Cloudflare retry cron after backoff. This is not provider acceptance or search indexing.
- Grok CLI review was retried against the public diff and returned HTTP 402, usage balance exhausted. No review verdict was produced or credits purchased. The tests and CI above are independently verified.

## Outcome boundaries

Production data, conversations, model keys and administrator credentials are not published. Repository transfer does not establish additional traffic, search indexing or external adoption.

References: [integration quickstarts](../../integrations/README.md), [growth execution](../growth/2026-10-03-launch.md), [preceding measurement release](growth-measurement-release.md), [GitHub transfer behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), [MCP versioning](https://modelcontextprotocol.io/registry/versioning).
