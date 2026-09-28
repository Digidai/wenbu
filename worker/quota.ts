import { DurableObject } from 'cloudflare:workers';
import type { Env } from './types';

export function positiveLimit(raw: string): number {
  if (!/^[1-9]\d{0,5}$/.test(raw)) throw new Error('Invalid limit configuration');
  return Number(raw);
}
export class UsageGate extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS quota (day TEXT NOT NULL, identity TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day,identity))',
    );
  }
  async reserve(identity: string): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
    return this.reserveAllowance(identity, 1, positiveLimit(this.env.AI_PER_USER_DAILY_LIMIT));
  }
  async reserveAgent(identity: string): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
    return this.reserveAllowance(
      'agent:' + identity,
      1,
      positiveLimit(this.env.AGENT_PER_USER_DAILY_LIMIT ?? '12'),
      true,
    );
  }
  async reserveAgentStep() {
    return this.reserveAllowance(
      'agent-global',
      1,
      positiveLimit(this.env.AGENT_GLOBAL_DAILY_LIMIT ?? '600'),
    );
  }
  private async reserveAllowance(identity: string, units: number, userLimit: number, agentStart = false) {
    const globalLimit = positiveLimit(this.env.AI_DAILY_LIMIT);
    const day = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const sql = this.ctx.storage.sql;
    // A synchronous SQLite transaction reserves global AND user allowance. No await inside.
    const result = this.ctx.storage.transactionSync(() => {
      sql.exec('DELETE FROM quota WHERE day <> ?', day);
      const count = (key: string) =>
        Number(
          [...sql.exec<{ count: number }>('SELECT count FROM quota WHERE day=? AND identity=?', day, key)][0]
            ?.count ?? 0,
        );
      const global = count('global');
      const user = count(identity);
      if (agentStart && count('agent-global') >= positiveLimit(this.env.AGENT_GLOBAL_DAILY_LIMIT ?? '600'))
        return { allowed: false, remaining: 0, reason: 'agent_budget' };
      if (global + units > globalLimit) return { allowed: false, remaining: 0, reason: 'daily_budget' };
      if (user >= userLimit) return { allowed: false, remaining: 0, reason: 'daily_allowance' };
      for (const [key, amount] of [
        ['global', units],
        [identity, 1],
      ] as const)
        sql.exec(
          'INSERT INTO quota(day,identity,count) VALUES(?,?,?) ON CONFLICT(day,identity) DO UPDATE SET count=count+excluded.count',
          day,
          key,
          amount,
        );
      if (agentStart)
        sql.exec(
          'INSERT INTO quota(day,identity,count) VALUES(?,?,1) ON CONFLICT(day,identity) DO UPDATE SET count=count+1',
          day,
          'agent-global',
        );
      return { allowed: true, remaining: userLimit - user - 1 };
    });
    // Storage is automatically expired even if traffic never returns. Attempts include failures,
    // because a timed-out upstream request may still incur cost. No unsafe automatic refund.
    if (!(await this.ctx.storage.getAlarm()))
      await this.ctx.storage.setAlarm(Date.now() + 25 * 60 * 60 * 1000);
    return result;
  }
  async alarm() {
    const day = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    this.ctx.storage.sql.exec('DELETE FROM quota WHERE day <> ?', day);
    const rows = [...this.ctx.storage.sql.exec<{ count: number }>('SELECT COUNT(*) AS count FROM quota')][0]
      .count;
    if (rows > 0) await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
  }
}
