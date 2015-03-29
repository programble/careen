'use strict';

import R = require('ramda');
import Promise = require('bluebird');

import client = require('./index');

export interface Config {
  tables?: {[s: string]: Object[]};
  sql?: string[];
}

interface DataSet {
  tables: {[s: string]: Object[]};
  sql: string[];
}

interface DB {
  live: DataSet;
  transaction?: DataSet;
  rollback?: DataSet;
}

export function connect(config: Config): Promise<DB> {
  return Promise.resolve({
    live: {
      tables: config.tables || {},
      sql: config.sql || []
    },
    transaction: null,
    rollback: null
  });
}

export function disconnect(db: DB) {
  return Promise.resolve();
}

export function beginTransaction(db: DB) {
  db.rollback = R.clone(db.live);
  db.transaction = R.clone(db.live);
  return Promise.resolve();
}

export function commitTransaction(db: DB) {
  db.live = db.transaction;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

export function rollbackTransaction(db: DB) {
  db.live = db.rollback;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

export function ensureJournal(db: DB, tableName: string) {
  var tables = (db.transaction || db.live).tables;
  if (!tables[tableName]) tables[tableName] = [];
  return Promise.resolve();
}

export function appendJournal(db: DB, tableName: string, entry: client.JournalEntryIn) {
  var journal = (db.transaction || db.live).tables[tableName];
  journal.push(R.assoc('timestamp', new Date(), entry));
  return Promise.resolve();
}

export function readJournal(db: DB, tableName: string) {
  var entries = (db.transaction || db.live).tables[tableName];
  return Promise.resolve(<client.JournalEntry[]> entries);
}

export function runMigrationSQL(db: DB, sql: string) {
  if (sql.indexOf('ERROR') === 0) {
    return Promise.reject(new Error(sql));
  }
  (db.transaction || db.live).sql.push(sql);
  return Promise.resolve();
}
