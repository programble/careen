'use strict';

import Promise = require('bluebird');

export interface Connection {}

export enum Operation { apply, revert }

export interface JournalEntryIn {
  operation: Operation;
  migrationID: string;
  migrationName: string;
}

export interface JournalEntry extends JournalEntryIn {
  timestamp: Date;
}

export interface Client {
  connect(config: {[s: string]: any}): Promise<Connection>;
  disconnect(db: Connection): Promise<any>;

  beginTransaction(db: Connection): Promise<any>;
  commitTransaction(db: Connection): Promise<any>;
  rollbackTransaction(db: Connection): Promise<any>;

  ensureJournal(db: Connection, tableName: string): Promise<any>;
  appendJournal(db: Connection, tableName: string, entry: JournalEntryIn): Promise<any>;
  readJournal(db: Connection, tableName: string): Promise<JournalEntry[]>;

  runMigrationSQL(db: Connection, sql: string): Promise<any>;
}
