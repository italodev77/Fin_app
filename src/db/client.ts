import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

export type Db = SQLite.SQLiteDatabase;

let dbPromise: Promise<Db> | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function migrate(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let version = current; version < MIGRATIONS.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

async function open(): Promise<Db> {
  const db = await SQLite.openDatabaseAsync('fin.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

export function getDb(): Promise<Db> {
  dbPromise ??= open();
  return dbPromise;
}

export function inTransaction<T>(work: (db: Db) => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await getDb();
    let result!: T;
    await db.withTransactionAsync(async () => {
      result = await work(db);
    });
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
