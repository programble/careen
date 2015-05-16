'use strict';

import * as Promise from 'bluebird';

// Configuration required to establish a database connection.
export interface Config {}

// Database connection.
export interface Connection {}

// Migration operations. Clients should use their string values when writing to
// the database for readability.
export enum Operation { apply, revert }

// Journal entry for writing to the database.
export interface JournalEntryIn {
  operation: Operation;
  migrationID: string;
  migrationName: string;
}

// Journal entry read from the database.
export interface JournalEntry extends JournalEntryIn {
  timestamp: Date;
}

export interface Client {
  // Establish a connection to the database specified by config.
  connect(config: Config): Promise<Connection>;

  // Disconnect from the database.
  disconnect(db: Connection): Promise<any>;

  // Begin a transaction.
  beginTransaction(db: Connection): Promise<any>;

  // Commit a transaction.
  commitTransaction(db: Connection): Promise<any>;

  // Rollback a transaction.
  rollbackTransaction(db: Connection): Promise<any>;

  // Ensure that a journal table exists named tableName.
  ensureJournal(db: Connection, tableName: string): Promise<any>;

  // Append a journal entry to the journal named tableName.
  appendJournal(db: Connection, tableName: string, entry: JournalEntryIn): Promise<any>;

  // Read journal entries from the table named tableName.
  readJournal(db: Connection, tableName: string): Promise<JournalEntry[]>;

  // Run arbitrary migration SQL statements.
  runMigrationSQL(db: Connection, sql: string): Promise<any>;
}
