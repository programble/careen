'use strict';

import Promise = require('bluebird');

import files = require('./files');
import clientInterface = require('./client/index');
import Client = clientInterface.Client;
import Config = clientInterface.Config;
import Operation = clientInterface.Operation;

function requireClient(name: string): Client {
  return require('./clients/' + name);
}

function useConnection(client: Client, config: Config) {
  return client.connect(config).disposer(client.disconnect);
}

export function readJournal(
  clientName: string, config: Config, journalTable: string
) {
  var client = requireClient(clientName);
  return Promise.using(useConnection(client, config), (db) =>
    client.ensureJournal(db, journalTable)
      .then(() => client.readJournal(db, journalTable))
  );
}

function eachRunner(
  operation: Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
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
  operation: Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
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
  operation: Operation, readSQL: (migration: files.Migration) => Promise<string>
) {
  return function(
    clientName: string,
    config: Config,
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

export var applyEach = eachRunner(Operation.apply, files.readUpSQL);
export var applyAll = allRunner(Operation.apply, files.readUpSQL);
export var applyDry = dryRunner(Operation.apply, files.readUpSQL);

export var revertEach = eachRunner(Operation.revert, files.readDownSQL);
export var revertAll = allRunner(Operation.revert, files.readDownSQL);
export var revertDry = dryRunner(Operation.revert, files.readDownSQL);
