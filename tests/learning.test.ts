import { describe, expect, it } from 'vitest';
import { articles } from '../src/data/articles';
import { guidePrimers, learningTopics, newGuideSlugs } from '../src/data/learning-paths';
import { safePage } from '../src/lib/analytics-contract';
import { libraryDocuments, readLibrary } from '../worker/agent-library';

describe('public learning catalogue', () => {
  it('gives every guide one visible topic and preserves valid primer targets', () => {
    const visible = learningTopics.flatMap((topic) => [...topic.slugs]);
    const guides = articles.filter((a) => a.category === 'learn').map((a) => a.slug);
    expect(new Set(visible).size).toBe(visible.length);
    expect([...visible].sort()).toEqual(guides.sort());
    for (const slug of Object.keys(guidePrimers)) expect(visible).toContain(slug);
  });

  it('makes each new guide readable through the Agent in both languages', () => {
    for (const locale of ['zh', 'en'] as const) {
      const documents = libraryDocuments(locale);
      for (const slug of newGuideSlugs) {
        const article = articles.find((item) => item.slug === slug)!;
        const doc = documents.find((item) => item.id === `guide-${slug}`)!;
        expect(doc.title).toBe(article[locale].title);
        const reading = readLibrary(doc.id, locale);
        expect(reading.content).toContain(article[locale].sections.at(-1)!.paragraphs[0]);
        expect(reading.source.url).toBe(
          `https://wenbu.genedai.me/${locale === 'en' ? 'en/' : ''}learn/${slug}/`,
        );
      }
    }
  });

  it('attributes new guide visits without collecting a query or personal suffix', () => {
    for (const slug of newGuideSlugs) {
      expect(safePage(`/en/learn/${slug}/?question=private`)).toBe(`/learn/${slug}/`);
      expect(safePage(`/learn/${slug}/private-birth-details`)).toBe('/other/');
    }
  });
});
