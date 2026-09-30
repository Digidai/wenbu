export const PRIMARY_ORIGIN = 'https://wenbu.app';
export const LEGACY_ORIGIN = 'https://wenbu.genedai.me';
const JOURNAL = 'wenbu.journal.v1';
const SESSIONS = 'wenbu.agent.sessions.v1';
const PREFERENCE = 'wenbu.analytics.disabled';
type RecordWithId = Record<string, unknown> & { id: string };
export type LocalHistory = {
  type: 'wenbu-domain-move-v1';
  journal: RecordWithId[];
  sessions: RecordWithId[];
  analyticsDisabled: boolean;
};
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function records(value: unknown): RecordWithId[] {
  if (!Array.isArray(value) || value.some((x) => !x || typeof x !== 'object' || typeof x.id !== 'string'))
    throw new Error('invalid_history');
  return value;
}
export function localHistory(storage: StorageLike): LocalHistory {
  return {
    type: 'wenbu-domain-move-v1',
    journal: records(JSON.parse(storage.getItem(JOURNAL) || '[]')),
    sessions: records(JSON.parse(storage.getItem(SESSIONS) || '[]')),
    analyticsDisabled: storage.getItem(PREFERENCE) === 'true',
  };
}
// Only accept messages from the particular old-site window opened by this page.
export function isHistoryMessage(event: Pick<MessageEvent, 'origin' | 'source'>, source: Window | null) {
  return source !== null && event.source === source && event.origin === LEGACY_ORIGIN;
}
export function mergeHistory(storage: StorageLike, snapshot: LocalHistory) {
  if (snapshot?.type !== 'wenbu-domain-move-v1' || JSON.stringify(snapshot).length > 8_000_000)
    throw new Error('invalid_history');
  const current = localHistory(storage);
  const merge = (existing: RecordWithId[], incoming: RecordWithId[]) => {
    const byId = new Map(records(incoming).map((x) => [x.id, x]));
    // New-site edits always win when a transfer is repeated.
    for (const item of existing) byId.set(item.id, item);
    return [...byId.values()];
  };
  const journal = merge(current.journal, snapshot.journal);
  const sessions = merge(current.sessions, snapshot.sessions);
  const values = [
    JSON.stringify(journal),
    JSON.stringify(sessions),
    String(current.analyticsDisabled || snapshot.analyticsDisabled === true),
  ];
  if (journal.length > 100 || values[1].length > 3_600_000) throw new Error('storage_full');
  const keys = [JOURNAL, SESSIONS, PREFERENCE];
  const before = keys.map((key) => storage.getItem(key));
  try {
    keys.forEach((key, index) => storage.setItem(key, values[index]));
  } catch (error) {
    // Never delete old-origin records. Restore destination values on quota errors.
    keys.forEach((key, index) => {
      if (before[index] === null) storage.removeItem(key);
      else storage.setItem(key, before[index]!);
    });
    throw error;
  }
  return { journal: journal.length, sessions: sessions.length };
}
