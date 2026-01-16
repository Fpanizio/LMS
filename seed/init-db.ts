import { DatabaseSync } from 'node:sqlite';
import { authTables } from '../api/auth/tables.ts';
import { lmsTables } from '../api/lms/tables.ts';

export function initDatabase(dbPath: string): DatabaseSync {
  const db = new DatabaseSync(dbPath);

  db.exec(/* sql */ `
    PRAGMA foreign_keys = 1;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA cache_size = 2000;
    PRAGMA busy_timeout = 5000;
    PRAGMA temp_store = MEMORY;
  `);

  db.exec(authTables);
  db.exec(lmsTables);

  return db;
}
