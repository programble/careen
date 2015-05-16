'use strict';

import * as Promise from 'bluebird';

import { Migration, readUpSQL, readDownSQL } from './files';
import { Client, Config, Operation } from './client/index';

function requireClient(name: string): Client {
  return require('./client/' + name);
}

function useConnection(client: Client, config: Config) {
  return client.connect(config).disposer(client.disconnect);
}

export function readJournal(
  clientName: string, config: Config, journalTable: string
) {
  let client = requireClient(clientName);
  return Promise.using(useConnection(client, config), (db) =>
    client.ensureJournal(db, journalTable)
      .then(() => client.readJournal(db, journalTable))
  );
}

function eachRunner(
  operation: Operation, readSQL: (migration: Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
    journalTable: string,
    migrations: Migration[]
  ) {
    let client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .return(migrations)
        .each((migration: Migration) =>
          readSQL(migration).then(sql =>
            client.beginTransaction(db)
              .then(() => client.runMigrationSQL(db, sql))
              .then(() => client.appendJournal(db, journalTable, {
                operation: operation,
                migrationID: migration.id,
                migrationName: migration.name
              }))
              .catch(error => client.rollbackTransaction(db).throw(error))
              .then(() => client.commitTransaction(db))
          )
        )
    );
  };
}

function allRunner(
  operation: Operation, readSQL: (migration: Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
    journalTable: string,
    migrations: Migration[]
  ) {
    let client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .then(() => client.beginTransaction(db))
        .return(migrations)
        .each((migration: Migration) =>
          readSQL(migration).then(sql =>
            client.runMigrationSQL(db, sql)
              .then(() => client.appendJournal(db, journalTable, {
                operation: operation,
                migrationID: migration.id,
                migrationName: migration.name
              }))
          )
        )
        .catch(error => client.rollbackTransaction(db).throw(error))
        .then(() => client.commitTransaction(db))
    );
  };
}

function dryRunner(
  operation: Operation, readSQL: (migration: Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
    journalTable: string,
    migrations: Migration[]
  ) {
    let client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .then(() => client.beginTransaction(db))
        .return(migrations)
        .each((migration: Migration) =>
          readSQL(migration).then(sql =>
            client.runMigrationSQL(db, sql)
              .then(() => client.appendJournal(db, journalTable, {
                operation: operation,
                migrationID: migration.id,
                migrationName: migration.name
              }))
          )
        )
        .finally(() => client.rollbackTransaction(db))
    );
  };
}

// Exported as functions that create runner functions then apply them so that
// files.readUpSQL and files.readDownSQL can be spied in tests.

export function applyEach(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return eachRunner(Operation.apply, readUpSQL).apply(null, arguments);
}

export function applyAll(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return allRunner(Operation.apply, readUpSQL).apply(null, arguments);
}

export function applyDry(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return dryRunner(Operation.apply, readUpSQL).apply(null, arguments);
}

export function revertEach(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return eachRunner(Operation.revert, readDownSQL).apply(null, arguments);
}

export function revertAll(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return allRunner(Operation.revert, readDownSQL).apply(null, arguments);
}

export function revertDry(
  clientName: string,
  config: Config,
  journalTable: string,
  migrations: Migration[]
) {
  return dryRunner(Operation.revert, readDownSQL).apply(null, arguments);
}
