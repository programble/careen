'use strict';

import * as Promise from 'bluebird';
import { Client, ClientConfig, QueryResult } from 'pg';
Promise.promisifyAll(Client.prototype);

import { JournalEntryIn, JournalEntry, Operation } from './index';

// Allow specifying a database URL instead of individual options.
export interface Config extends ClientConfig {
  url?: string
}

export function connect(config: Config): Promise<Client> {
  let db = config.url
    ? new Client(config.url)
    : new Client(config);
  return db.connectAsync().return(db);
}

export function disconnect(db: Client) {
  return Promise.resolve(db.end());
}

// Run an SQL query and accumulate the result rows.
function runQuery(db: Client, sql: string, values?: any[]): Promise<QueryResult> {
  let query = db.query(sql, values);
  query.on('row', (row, result) => result.addRow(row));
  return new Promise(function(
    resolve: (value: QueryResult) => void,
    reject: (reason: any) => void
  ) {
    query.once('error', reject);
    query.once('end', resolve);
  });
}

export function beginTransaction(db: Client) {
  return runQuery(db, 'BEGIN;');
}

export function commitTransaction(db: Client) {
  return runQuery(db, 'COMMIT;');
}

export function rollbackTransaction(db: Client) {
  return runQuery(db, 'ROLLBACK;');
}

export function ensureJournal(db: Client, tableName: string) {
  return runQuery(db, `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      timestamp TIMESTAMP PRIMARY KEY,
      operation TEXT NOT NULL,
      migration_id TEXT NOT NULL,
      migration_name TEXT NOT NULL
    );
  `);
}

export function appendJournal(db: Client, tableName: string, entry: JournalEntryIn) {
  return runQuery(db, `
    INSERT INTO ${tableName} (timestamp, operation, migration_id, migration_name)
    VALUES (now(), $1, $2, $3);
  `, [
    Operation[entry.operation],
    entry.migrationID,
    entry.migrationName
  ]);
}

export function readJournal(db: Client, tableName: string) {
  return runQuery(db, `SELECT * FROM ${tableName} ORDER BY timestamp;`)
    .then(result => result.rows)
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

export function runMigrationSQL(db: Client, sql: string) {
  return runQuery(db, sql);
}
