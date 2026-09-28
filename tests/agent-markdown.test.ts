import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AgentMarkdown from '../src/components/AgentMarkdown';
const render = (text: string, allowedUrls: string[] = []) =>
  renderToStaticMarkup(createElement(AgentMarkdown, { text, allowedUrls }));
it('renders readable GFM tables inside an overflow container', () => {
  const html = render('| Pillar | Value |\n| --- | --- |\n| Year | 庚辰 |');
  expect(html).toContain('agent-table-scroll');
  expect(html).toContain('<table>');
  expect(html).toContain('庚辰');
});
it('does not render raw HTML, tracking images or unverified model links', () => {
  const html = render(
    '<script>alert(1)</script>\n\n![tracking](https://evil.example/pixel)\n\n[claim](https://evil.example)\n\n[bad](javascript:alert%281%29)',
  );
  expect(html).not.toMatch(/<script|<img|href=|javascript:/);
  expect(html).toContain('claim');
});
it('allows only the exact URL of a source actually supplied to the renderer', () => {
  const url = 'https://aa.usno.navy.mil/faq/eqtime';
  const html = render(`[source](${url}) [unread](${url}?tracking=1)`, [url]);
  expect(html.match(/<a /g)).toHaveLength(1);
  expect(html).toContain('rel="noopener noreferrer"');
});
