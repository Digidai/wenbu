# Microsoft Clarity installation

The requested public project yqzdf8z0sr is integrated on wenbu.app. Runtime source: 480bfe41aad014c2651a09e594b37f9253bd9f23. Worker version: a329a829-3df0-4335-9289-2d624b17dc9a. [Implementation PR](https://github.com/Digidai/wenbu/pull/7).

- Local verify: 274 tests / 20 suites, type checks, production build, 91 HTML pages and all site/art/knowledge/IndexNow audits passed; lint passed.
- [PR Quality](https://github.com/Digidai/wenbu/actions/runs/36888175828) and [merged-source Quality](https://github.com/Digidai/wenbu/actions/runs/36888532873) passed.
- Production: eight representative HTML routes matched built body prefixes; security headers allow the required Clarity origins; two home-page script assets matched bytes, including the Clarity loader. Details: [live evidence](clarity-installation-live.json).
- Headed browser: English privacy page at 390 px had no horizontal overflow. Initial opt-out produced no Clarity tag; enabling queued denied analytics/ad storage consent and the correct project tag; disabling queued stop. Opt-out persisted across navigation. Private Agent content had its explicit main-element mask. Admin pages had no Clarity tag. These checks cover the page integration and asynchronous queue, not an active Microsoft SDK recording.
- The verification machine could not download the Microsoft tag: Chromium returned ERR_CONNECTION_CLOSED and curl/Node TLS connections closed, including through the configured system proxy. No Clarity collect receipt, processed recording, heatmap or Microsoft dashboard availability is claimed. The page remains functional when the vendor is unreachable.
- Grok read-only review attempted: HTTP 402, usage balance exhausted; no Grok verdict.
- IndexNow post-deploy hook retained backoff and submitted zero URLs. No indexing claim.

The loader honors first-party opt-out/DNT/GPC and unavailable storage; excludes previews, marked test sessions, admin and migration routes; keeps consentv2 cookie storage denied; sends no custom visitor identity or private text. Tool/Agent/journal main content is masked in both languages. Clarity and first-party analytics have separate datasets. See [analytics documentation](../analytics.md) and the updated bilingual privacy pages.
