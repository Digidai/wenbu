import { knowledgeIndex } from '../../lib/knowledge';
export function GET() {
  return new Response(JSON.stringify(knowledgeIndex(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
