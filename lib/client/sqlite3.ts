'use strict';

import Promise = require('bluebird');
import Hemp = require('hemp');
import sqlite3 = require('sqlite3');
Promise.promisifyAll(sqlite3.Database.prototype);

import client = require('./index');

export interface Config {
  filename: string
}

export function connect(config: Config) {
  return new Promise(function(resolve: (result: sqlite3.Database) => void, reject) {
    var db = new sqlite3.Database(config.filename);
    db.once('error', reject);
    db.once('open', () => resolve(db));
  });
}

export function disconnect(db: sqlite3.Database) {
  return db.closeAsync();
}

export function beginTransaction(db: sqlite3.Database) {
  return db.runAsync('BEGIN;');
}

export function commitTransaction(db: sqlite3.Database) {
  return db.runAsync('COMMIT;');
}

export function rollbackTransaction(db: sqlite3.Database) {
  return db.runAsync('ROLLBACK;');
}

export function ensureJournal(db: sqlite3.Database, tableName: string) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TEXT NOT NULL,')
      ('operation TEXT NOT NULL,')
      ('migration_id TEXT NOT NULL,')
      ('migration_name TEXT NOT NULL')
    (')');
  return db.runAsync(sql.toString());
}

export function appendJournal(db: sqlite3.Database, tableName: string, entry: client.JournalEntryIn) {
  var sql = Hemp(' ', null, ';')
    ('INSERT INTO', tableName)
    ('(timestamp, operation, migration_id, migration_name)')
    ('VALUES')
    ("(datetime('now'), ?, ?, ?)");
  return db.runAsync(sql.toString(), [
    client.Operation[entry.operation],
    entry.migrationID,
    entry.migrationName
  ]);
}

export function readJournal(db: sqlite3.Database, tableName: string) {
  var sql = Hemp(' ', null, ';')
    ('SELECT * FROM', tableName)
    ('ORDER BY timestamp');
  return db.allAsync(sql.toString())
    .map(function(row: any): client.JournalEntry {
      return {
        timestamp: new Date(row.timestamp),
        operation: client.Operation[<string> row.operation],
        migrationID: <string> row.migration_id,
        migrationName: <string> row.migration_name
      };
    });
}

export function runMigrationSQL(db: sqlite3.Database, sql: string) {
  return db.execAsync(sql);
}
