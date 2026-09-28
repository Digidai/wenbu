import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function AgentMarkdown({ text, allowedUrls = [] }: { text: string; allowedUrls?: string[] }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      disallowedElements={['img', 'iframe', 'script', 'style', 'input']}
      components={{
        table: ({ children }) => (
          <div className="agent-table-scroll">
            <table>{children}</table>
          </div>
        ),
        a: ({ href, children }) =>
          href && allowedUrls.includes(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children} ↗
            </a>
          ) : (
            <span>{children}</span>
          ),
      }}
    >
      {text}
    </Markdown>
  );
}
