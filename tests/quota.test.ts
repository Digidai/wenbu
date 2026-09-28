import { describe, it, expect, vi, afterEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { UsageGate, positiveLimit } from '../worker/quota';
import type { Env } from '../worker/types';
const dbs: DatabaseSync[] = [];
function gate(globalLimit = 7, userLimit = 3) {
  const db = new DatabaseSync(':memory:');
  dbs.push(db);
  let alarm: number | null = null;
  const storage = {
    sql: { exec: (query: string, ...args: (string | number)[]) => db.prepare(query).all(...args) },
    transactionSync: <T>(fn: () => T) => {
      db.exec('BEGIN');
      try {
        const v = fn();
        db.exec('COMMIT');
        return v;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    getAlarm: async () => alarm,
    setAlarm: async (v: number) => {
      alarm = v;
    },
  };
  const instance = new UsageGate(
    { storage } as unknown as DurableObjectState,
    { AI_DAILY_LIMIT: String(globalLimit), AI_PER_USER_DAILY_LIMIT: String(userLimit) } as Env,
  );
  return { instance, db };
}
afterEach(() => {
  vi.useRealTimers();
  for (const db of dbs.splice(0)) db.close();
});
describe('atomic daily budget using real SQLite', () => {
  it('rejects malformed limit configuration', () => {
    for (const n of ['0', '-1', 'NaN', '1000000', '5.1', '']) expect(() => positiveLimit(n)).toThrow();
  });
  it('does not overspend for simultaneous requests by one user', async () => {
    const { instance } = gate();
    const results = await Promise.all(Array.from({ length: 25 }, () => instance.reserve('u1')));
    expect(results.filter((x) => x.allowed)).toHaveLength(3);
  });
  it('caps combined usage across many users', async () => {
    const { instance, db } = gate();
    const results = await Promise.all(Array.from({ length: 40 }, (_, i) => instance.reserve('u' + i)));
    expect(results.filter((x) => x.allowed)).toHaveLength(7);
    expect(db.prepare("SELECT count FROM quota WHERE identity='global'").get()?.count).toBe(7);
  });
  it('rejection does not increment the other counter', async () => {
    const { instance, db } = gate();
    for (let i = 0; i < 4; i++) await instance.reserve('same');
    expect(db.prepare("SELECT count FROM quota WHERE identity='global'").get()?.count).toBe(3);
  });
  it('resets at Shanghai midnight and prunes prior-day hashes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T15:59:00Z'));
    const { instance, db } = gate(7, 1);
    expect((await instance.reserve('user')).allowed).toBe(true);
    expect((await instance.reserve('user')).allowed).toBe(false);
    vi.setSystemTime(new Date('2026-09-28T16:01:00Z'));
    expect((await instance.reserve('user')).allowed).toBe(true);
    expect(db.prepare('SELECT DISTINCT day FROM quota').all()).toEqual([{ day: '2026-09-29' }]);
  });
  it('alarm cannot erase the current-day budget', async () => {
    const { instance } = gate(7, 1);
    await instance.reserve('user');
    await instance.alarm();
    expect((await instance.reserve('user')).allowed).toBe(false);
  });
});

describe('Agent and original reading budgets', () => {
  it('charges actual model calls while separating network turn counts', async () => {
    const { instance, db } = gate(20, 2);
    expect((await instance.reserveAgent('same')).remaining).toBe(11);
    await instance.reserveAgentStep();
    await instance.reserveAgentStep();
    expect((await instance.reserve('same')).remaining).toBe(1);
    expect(db.prepare("SELECT count FROM quota WHERE identity='global'").get()?.count).toBe(4);
    expect(db.prepare("SELECT count FROM quota WHERE identity='agent-global'").get()?.count).toBe(3);
    expect(db.prepare("SELECT count FROM quota WHERE identity='agent:same'").get()?.count).toBe(1);
  });
  it('enforces the shared global limit across concurrent Agent steps and readings', async () => {
    const { instance, db } = gate(7, 3);
    await instance.reserveAgent('a');
    const results = await Promise.all(
      Array.from({ length: 30 }, (_, i) => (i % 2 ? instance.reserveAgentStep() : instance.reserve('u' + i))),
    );
    expect(results.filter((r) => r.allowed)).toHaveLength(6);
    expect(db.prepare("SELECT count FROM quota WHERE identity='global'").get()?.count).toBe(7);
  });
  it('reserves capacity for original readings when the Agent sub-budget ends', async () => {
    const { instance, db } = gate(1000, 5);
    const results = await Promise.all(Array.from({ length: 610 }, () => instance.reserveAgentStep()));
    expect(results.filter((r) => r.allowed)).toHaveLength(600);
    expect((await instance.reserveAgent('fresh')).allowed).toBe(false);
    expect((await instance.reserve('fresh')).allowed).toBe(true);
    expect(db.prepare("SELECT count FROM quota WHERE identity='agent-global'").get()?.count).toBe(600);
    expect(db.prepare("SELECT count FROM quota WHERE identity='global'").get()?.count).toBe(601);
  });
});
