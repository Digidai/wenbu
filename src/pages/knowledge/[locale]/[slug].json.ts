import { articles, type Article } from '../../../data/articles';
import { knowledgeDocument } from '../../../lib/knowledge';
import type { Locale } from '../../../lib/schema';
export function getStaticPaths() {
  return articles
    .filter((a) => a.category === 'learn')
    .flatMap((article) =>
      (['zh', 'en'] as const).map((locale) => ({
        params: { locale, slug: article.slug },
        props: { article, locale },
      })),
    );
}
export function GET({ props }: { props: { article: Article; locale: Locale } }) {
  return new Response(JSON.stringify(knowledgeDocument(props.article, props.locale), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
