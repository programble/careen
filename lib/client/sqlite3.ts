'use strict';

import * as Promise from 'bluebird';
import { Database } from 'sqlite3';
Promise.promisifyAll(Database.prototype);

import { JournalEntryIn, JournalEntry, Operation } from './index';

export interface Config {
  filename: string
}

export function connect(config: Config) {
  return new Promise(function(
    resolve: (result: Database) => void,
    reject: (error: any) => void
  ) {
    let db = new Database(config.filename);
    db.once('error', reject);
    db.once('open', () => resolve(db));
  });
}

export function disconnect(db: Database) {
  return db.closeAsync();
}

export function beginTransaction(db: Database) {
  return db.runAsync('BEGIN;');
}

export function commitTransaction(db: Database) {
  return db.runAsync('COMMIT;');
}

export function rollbackTransaction(db: Database) {
  return db.runAsync('ROLLBACK;');
}

export function ensureJournal(db: Database, tableName: string) {
  return db.runAsync(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      timestamp TEXT NOT NULL,
      operation TEXT NOT NULL,
      migration_id TEXT NOT NULL,
      migration_name TEXT NOT NULL
    );
  `);
}

export function appendJournal(db: Database, tableName: string, entry: JournalEntryIn) {
  return db.runAsync(`
    INSERT INTO ${tableName} (timestamp, operation, migration_id, migration_name)
    VALUES (datetime('now'), ?, ?, ?);
  `, [
    Operation[entry.operation],
    entry.migrationID,
    entry.migrationName
  ]);
}

export function readJournal(db: Database, tableName: string) {
  return db.allAsync(`SELECT * FROM ${tableName} ORDER BY timestamp;`)
    .map(function(row: any): JournalEntry {
      return {
        timestamp: new Date(row.timestamp),
        // TypeScript doesn't admit that its enums are indexable.
        operation: <any> Operation[row.operation],
        migrationID: <string> row.migration_id,
        migrationName: <string> row.migration_name
      };
    });
}

export function runMigrationSQL(db: Database, sql: string) {
  return db.execAsync(sql);
}
