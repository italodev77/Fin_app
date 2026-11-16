import { settingsFromRecord, settingsToRecord } from '@/domain/settings';
import type { Settings } from '@/domain/types';
import { getDb, inTransaction } from './client';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  return settingsFromRecord(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function saveSettings(settings: Settings): Promise<void> {
  await inTransaction(async (db) => {
    for (const [key, value] of Object.entries(settingsToRecord(settings))) {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value],
      );
    }
  });
}
