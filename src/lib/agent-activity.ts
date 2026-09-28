import type { AgentMessage } from './agent-protocol';

export type AgentPhase =
  | 'opening'
  | 'reading'
  | 'calculating'
  | 'drawing'
  | 'composing'
  | 'responding'
  | 'continuing'
  | 'clarifying'
  | 'revisiting'
  | 'waiting'
  | 'settled'
  | 'interrupted';

// Derived exclusively from received events. Elapsed time never advances a stage.
export function agentActivity(message: AgentMessage): { phase: AgentPhase; instrument?: string } {
  if (['error', 'limited', 'stopped'].includes(message.status)) return { phase: 'interrupted' };
  if (message.status === 'waiting' || message.question) return { phase: 'waiting' };
  if (message.status === 'complete') return { phase: 'settled' };
  const tool = [...message.tools].reverse().find((item) => item.status === 'running');
  if (tool) {
    if (['search_library', 'read_library', 'read_reference'].includes(tool.name)) return { phase: 'reading' };
    if (['calculate_bazi', 'calculate_ziwei'].includes(tool.name))
      return { phase: 'calculating', instrument: tool.name };
    if (['draw_tarot', 'cast_iching'].includes(tool.name)) return { phase: 'drawing', instrument: tool.name };
    if (tool.name === 'write_report') return { phase: 'composing' };
    if (tool.name === 'ask_user') return { phase: 'clarifying' };
  }
  if (message.tools.at(-1)?.status === 'error') return { phase: 'revisiting' };
  if (message.artifacts.length || message.text) return { phase: 'responding' };
  if (message.tools.length) return { phase: 'continuing' };
  return { phase: 'opening' };
}
