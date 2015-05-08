'use strict';

import Promise = require('bluebird');

import files = require('./files');
// To not conflict with client instances.
import c = require('./client/index');

function requireClient(name: string): c.Client {
  return require('./client/' + name);
}

function useConnection(client: c.Client, config: c.Config) {
  return client.connect(config).disposer(client.disconnect);
}

export function readJournal(
  clientName: string, config: c.Config, journalTable: string
) {
  var client = requireClient(clientName);
  return Promise.using(useConnection(client, config), (db) =>
    client.ensureJournal(db, journalTable)
      .then(() => client.readJournal(db, journalTable))
  );
}

function eachRunner(
  operation: c.Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: c.Config,
    journalTable: string,
    migrations: files.Migration[]
  ) {
    var client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .return(migrations)
        .each((migration: files.Migration) =>
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
  operation: c.Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: c.Config,
    journalTable: string,
    migrations: files.Migration[]
  ) {
    var client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .then(() => client.beginTransaction(db))
        .return(migrations)
        .each((migration: files.Migration) =>
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
  operation: c.Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: c.Config,
    journalTable: string,
    migrations: files.Migration[]
  ) {
    var client = requireClient(clientName);
    return Promise.using(useConnection(client, config), db =>
      client.ensureJournal(db, journalTable)
        .then(() => client.beginTransaction(db))
        .return(migrations)
        .each((migration: files.Migration) =>
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
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return eachRunner(c.Operation.apply, files.readUpSQL).apply(null, arguments);
}

export function applyAll(
  clientName: string,
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return allRunner(c.Operation.apply, files.readUpSQL).apply(null, arguments);
}

export function applyDry(
  clientName: string,
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return dryRunner(c.Operation.apply, files.readUpSQL).apply(null, arguments);
}

export function revertEach(
  clientName: string,
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return eachRunner(c.Operation.revert, files.readDownSQL).apply(null, arguments);
}

export function revertAll(
  clientName: string,
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return allRunner(c.Operation.revert, files.readDownSQL).apply(null, arguments);
}

export function revertDry(
  clientName: string,
  config: c.Config,
  journalTable: string,
  migrations: files.Migration[]
) {
  return dryRunner(c.Operation.revert, files.readDownSQL).apply(null, arguments);
}
