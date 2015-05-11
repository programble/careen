'use strict';

import Promise = require('bluebird');
import pg = require('pg');
Promise.promisifyAll(pg.Client.prototype);

import client = require('./index');

// Allow specifying a database URL instead of individual options.
export interface Config extends pg.ClientConfig {
  url?: string
}

export function connect(config: Config): Promise<pg.Client> {
  let db = config.url
    ? new pg.Client(config.url)
    : new pg.Client(config);
  return db.connectAsync().return(db);
}

export function disconnect(db: pg.Client) {
  return Promise.resolve(db.end());
}

// Run an SQL query and accumulate the result rows.
function runQuery(db: pg.Client, sql: string, values?: any[]): Promise<pg.QueryResult> {
  let query = db.query(sql, values);
  query.on('row', (row, result) => result.addRow(row));
  return new Promise(function(
    resolve: (value: pg.QueryResult) => void,
    reject: (reason: any) => void
  ) {
    query.once('error', reject);
    query.once('end', resolve);
  });
}

export function beginTransaction(db: pg.Client) {
  return runQuery(db, 'BEGIN;');
}

export function commitTransaction(db: pg.Client) {
  return runQuery(db, 'COMMIT;');
}

export function rollbackTransaction(db: pg.Client) {
  return runQuery(db, 'ROLLBACK;');
}

export function ensureJournal(db: pg.Client, tableName: string) {
  return runQuery(db, `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      timestamp TIMESTAMP PRIMARY KEY,
      operation TEXT NOT NULL,
      migration_id TEXT NOT NULL,
      migration_name TEXT NOT NULL
    );
  `);
}

export function appendJournal(db: pg.Client, tableName: string, entry: client.JournalEntryIn) {
  return runQuery(db, `
    INSERT INTO ${tableName} (timestamp, operation, migration_id, migration_name)
    VALUES (now(), $1, $2, $3);
  `, [
    client.Operation[entry.operation],
    entry.migrationID,
    entry.migrationName
  ]);
}

export function readJournal(db: pg.Client, tableName: string) {
  return runQuery(db, `SELECT * FROM ${tableName} ORDER BY timestamp;`)
    .then(result => result.rows)
    .map(function(row: any): client.JournalEntry {
      return {
        timestamp: new Date(row.timestamp),
        // TypeScript doesn't admit that its enums are indexable.
        operation: <any> client.Operation[row.operation],
        migrationID: <string> row.migration_id,
        migrationName: <string> row.migration_name
      };
    });
}

export function runMigrationSQL(db: pg.Client, sql: string) {
  return runQuery(db, sql);
}
