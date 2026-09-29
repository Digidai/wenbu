/** Durable at-least-once delivery. Event IDs provide server-side deduplication. */
export type PendingEvent = { id: string; occurredAt: number; [key: string]: unknown };
let database: Promise<IDBDatabase> | undefined;
const fallback = new Map<string, PendingEvent>();
let fallbackDropped = 0;
function open() {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('wenbu-analytics', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('outbox', { keyPath: 'id' });
      store.createIndex('time', 'occurredAt');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Storage blocked'));
  });
  return database;
}
async function transaction<T>(
  write: boolean,
  action: (store: IDBObjectStore, done: (value: T) => void) => void,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', write ? 'readwrite' : 'readonly');
    let result: T;
    action(tx.objectStore('outbox'), (value) => {
      result = value;
    });
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function enqueue(event: PendingEvent): Promise<void> {
  try {
    await transaction<void>(true, (s, done) => {
      s.put(event);
      done();
    });
  } catch {
    fallback.set(event.id, event);
    if (fallback.size > 1000) {
      fallback.delete(fallback.keys().next().value!);
      fallbackDropped++;
    }
  }
}
export async function pendingEvents(limit: number): Promise<PendingEvent[]> {
  try {
    const stored = await transaction<PendingEvent[]>(false, (s, done) => {
      const request = s.index('time').getAll(undefined, limit);
      request.onsuccess = () => done(request.result);
    });
    return [...new Map([...stored, ...fallback.values()].map((e) => [e.id, e])).values()]
      .sort((a, b) => a.occurredAt - b.occurredAt)
      .slice(0, limit);
  } catch {
    return [...fallback.values()].slice(0, limit);
  }
}
export async function removeEvents(ids?: string[]) {
  if (!ids) {
    fallback.clear();
    fallbackDropped = 0;
  } else ids.forEach((id) => fallback.delete(id));
  try {
    await transaction<void>(true, (s, done) => {
      if (ids) ids.forEach((id) => s.delete(id));
      else s.clear();
      done();
    });
  } catch {
    /* Memory fallback was cleared too. */
  }
}
export async function trimOutbox(): Promise<{ expired: number; overflow: number }> {
  let memoryExpired = 0;
  for (const [id, event] of fallback)
    if (event.occurredAt < Date.now() - 7 * 86400000) {
      fallback.delete(id);
      memoryExpired++;
    }
  const memoryOverflow = fallbackDropped;
  fallbackDropped = 0;
  try {
    return await transaction(true, (s, done) => {
      let kept = 0,
        expired = 0,
        overflow = 0;
      const cursor = s.index('time').openCursor(null, 'prev');
      cursor.onsuccess = () => {
        const item = cursor.result;
        if (!item) {
          done({ expired: expired + memoryExpired, overflow: overflow + memoryOverflow });
          return;
        }
        if (item.value.occurredAt < Date.now() - 7 * 86400000) {
          expired++;
          item.delete();
        } else if (++kept > 1000) {
          overflow++;
          item.delete();
        }
        item.continue();
      };
    });
  } catch {
    return { expired: memoryExpired, overflow: memoryOverflow };
  }
}
