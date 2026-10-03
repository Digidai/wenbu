# Build with Wenbu · 接入问卜

[Wenbu.app](https://wenbu.app/en/agents/?utm_source=github&utm_medium=referral&utm_campaign=open-source-2026) is a free, bilingual place to explore BaZi, the I Ching, tarot and Zi Wei. Its calculations expose their conventions. Its learning library provides 21 full guides in Chinese and English. These traditions support cultural learning and reflection; they are not scientifically established forecasts.

Choose a connection that fits your workflow:

| Connection     | Start here                                                                                                       | Account / model key                | Output                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Remote MCP     | [Configuration and first tool call](mcp/README.md)                                                               | None; your host supplies its model | Structured chart/draw data and original learning content     |
| CLI            | [Download, inspect, run](cli/README.md)                                                                          | None for calculations / guides     | JSON, Markdown, or streamed Agent events                     |
| Agent Skill    | [Installable Wenbu skill](../skills/wenbu/SKILL.md)                                                              | Depends on your host               | Instructions for tool selection, evidence and chosen context |
| Built-in Agent | [Web workspace](https://wenbu.app/en/agent/?utm_source=github&utm_medium=referral&utm_campaign=open-source-2026) | No account; published daily limits | Tool execution, source-based notes and follow-up questions   |

中文完整教程：[Agent 接入](https://wenbu.app/agents/?utm_source=github&utm_medium=referral&utm_campaign=open-source-2026)。MCP 不调用 DeepSeek；内置 Agent 才会将你选择发送的内容交给 DeepSeek。独立计算和知识读取不需要模型密钥。

## First result, without personal information

```sh
node public/wenbu.mjs iching '{"lines":[7,7,7,7,7,7],"locale":"en"}'
```

Expected: `kind: "iching"`, original hexagram number `1`, and no changing lines. No birth data, random cast or model call is involved. Respect rate limits; do not automatically repeat AI requests.

## What is open source?

The [MIT-licensed repository](../LICENSE) contains the website, deterministic calculation adapters, Cloudflare Worker, MCP implementation, dependency-free CLI, Skill, public schemas, tests and documentation. Production keys, private analytics, feedback and conversations are not part of the repository.

Release archives are built from the same checked-in files by [build-integrations.mjs](../scripts/build-integrations.mjs). SHA-256 checksums accompany each release. CLI archives can be installed from a local tarball; they are not a claim that a package has been published to npm.

## Context and evidence

Only send inputs the person has chosen for the task. The CLI does not discover files, read chat history or sync a journal. Keep personal fields in a named file or stdin. MCP search returns original guides and reference metadata; an external source link must be opened by the host before citing its contents. Preserve returned conventions, warnings and partial-read scope.

[Methodology](https://wenbu.app/en/methodology/) · [Privacy](https://wenbu.app/en/privacy/) · [AI allowance](https://wenbu.app/en/free/) · [OpenAPI](https://wenbu.app/openapi.json) · [Streaming protocol](https://wenbu.app/agent-protocol.md)
