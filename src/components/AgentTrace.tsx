import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, CircleAlert, CirclePause } from 'lucide-react';
import type { AgentMessage } from '../lib/agent-protocol';
import type { Locale } from '../lib/schema';
import InstrumentGlyph, { type InstrumentKind } from './InstrumentGlyph';

const groups: { names: string[]; icon: InstrumentKind; zh: string; en: string }[] = [
  { names: ['search_library', 'read_library', 'read_reference'], icon: 'library', zh: '查阅', en: 'Read' },
  {
    names: ['calculate_bazi', 'calculate_ziwei', 'cast_iching', 'draw_tarot'],
    icon: 'bazi',
    zh: '推演',
    en: 'Calculate',
  },
  { names: ['write_report'], icon: 'report', zh: '成稿', en: 'Write' },
  { names: ['ask_user'], icon: 'library', zh: '补充', en: 'Clarify' },
];

export default function AgentTrace({
  message,
  locale,
  children,
}: {
  message: AgentMessage;
  locale: Locale;
  children: ReactNode;
}) {
  const tools = message.tools.filter((tool) => tool.name !== 'update_plan');
  const failed = tools.filter((tool) => tool.status === 'error').length;
  const stopped = tools.filter((tool) => tool.status === 'stopped').length;
  const exceptions = failed + stopped;
  const [open, setOpen] = useState(exceptions > 0);
  const priorExceptions = useRef(exceptions);
  useEffect(() => {
    if (exceptions > priorExceptions.current) setOpen(true);
    priorExceptions.current = exceptions;
  }, [exceptions]);
  if (!tools.length) return null;
  const zh = locale === 'zh';
  return (
    <details className="agent-trace" open={open}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <span className="trace-route">
          {groups.map((group) => {
            const matches = tools.filter((tool) => group.names.includes(tool.name));
            if (!matches.length) return null;
            const running = message.status === 'running' && matches.some((tool) => tool.status === 'running');
            return (
              <span className={`trace-station ${running ? 'is-running' : ''}`} key={group.en}>
                <InstrumentGlyph kind={group.icon} size={27} />
                <span>
                  {zh ? group.zh : group.en}
                  <small> × {matches.length}</small>
                </span>
              </span>
            );
          })}
        </span>
        <span className="trace-disclosure">
          {zh ? '过程' : 'Activity'}
          <ChevronDown size={13} />
        </span>
        {(failed > 0 || stopped > 0) && (
          <span className="trace-exceptions">
            {failed > 0 && (
              <span>
                <CircleAlert size={12} />
                {zh ? `${failed} 次未成功` : `${failed} failed attempt${failed === 1 ? '' : 's'}`}
              </span>
            )}
            {stopped > 0 && (
              <span>
                <CirclePause size={12} />
                {zh ? `${stopped} 次已停止` : `${stopped} stopped`}
              </span>
            )}
          </span>
        )}
      </summary>
      <div className="agent-tool-log" aria-label={zh ? '实际执行记录' : 'Execution activity'}>
        {children}
      </div>
    </details>
  );
}
