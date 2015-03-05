'use strict';

/**
 * Migration runner.
 * @module Runner
 */

var R = require('ramda');
var Promise = require('bluebird');

var Files = require('./files');

/**
 * Require a {@link Client}.
 * @param {string} client - Client name
 * @returns {Client}
 */
function requireClient(client) {
  return require('./clients/' + client);
}

/**
 * Connect a {@link Client} with a disconnect disposer.
 * @param {Client} Client
 * @param {Object} configuration - Client configuration
 * @returns {Disposer.<Client~Connection>}
 */
function useConnection(Client, configuration) {
  return Client.connect(configuration).disposer(Client.disconnect);
}

/**
 * Read migration journal. See {@link Client.readJournal}. Curried.
 * @alias module:Runner.readJournal
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @returns {Promise.<Client.JournalEntry[]>}
 */
function readJournal(client, configuration, journalTable) {
  var Client = requireClient(client);
  return Promise.using(useConnection(Client, configuration), function(db) {
    return Client.ensureJournal(db, journalTable)
      .then(R.partial(Client.readJournal, db, journalTable));
  });
}

/**
 * Apply migrations each in a transaction. Stop if an error occurs. Curried.
 * @alias module:Runner.applyEach
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to run
 * @returns {Promise.<*>}
 */
function applyEach(client, configuration, journalTable, migrations) {
  var Client = requireClient(client);
  return Promise.using(useConnection(Client, configuration), function(db) {
    var ensureJournal = R.partial(Client.ensureJournal, db, journalTable);
    var beginTransaction = R.partial(Client.beginTransaction, db);
    var rollbackTransaction = R.partial(Client.rollbackTransaction, db);
    var commitTransaction = R.partial(Client.commitTransaction, db);

    return ensureJournal()
      .return(migrations)
      .each(function(migration) {
        return Files.readUpSQL(migration).then(function(sql) {
          var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
          var appendJournal = R.partial(
            Client.appendJournal,
            db,
            journalTable,
            'apply',
            migration.id,
            migration.name
          );

          return beginTransaction()
            .then(runMigrationSQL)
            .then(appendJournal)
            .catch(function(error) {
              return rollbackTransaction().throw(error);
            })
            .then(commitTransaction);
        });
      });
  });
}

/**
 * Apply migrations all in a transaction. Rollback all migrations if an error
 * occurs. Curried.
 *
 * @alias module:Runner.applyAll
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to run
 * @returns {Promise.<*>}
 */
function applyAll(client, configuration, journalTable, migrations) {
  var Client = requireClient(client);
  return Promise.using(useConnection(Client, configuration), function(db) {
    var ensureJournal = R.partial(Client.ensureJournal, db, journalTable);
    var beginTransaction = R.partial(Client.beginTransaction, db);
    var rollbackTransaction = R.partial(Client.rollbackTransaction, db);
    var commitTransaction = R.partial(Client.commitTransaction, db);

    return ensureJournal()
      .then(beginTransaction)
      .return(migrations)
      .each(function(migration) {
        return Files.readUpSQL(migration).then(function(sql) {
          var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
          var appendJournal = R.partial(
            Client.appendJournal,
            db,
            journalTable,
            'apply',
            migration.id,
            migration.name
          );

          return runMigrationSQL().then(appendJournal);
        });
      })
      .catch(function(error) {
        return rollbackTransaction().throw(error);
      })
      .then(commitTransaction);
  });
}

/**
 * Apply migrations in a transaction then rollback. Curried.
 * @alias module:Runner.applyDry
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to run
 * @returns {Promise.<*>}
 */
function applyDry(client, configuration, journalTable, migrations) {
  var Client = requireClient(client);
  return Promise.using(useConnection(Client, configuration), function(db) {
    var ensureJournal = R.partial(Client.ensureJournal, db, journalTable);
    var beginTransaction = R.partial(Client.beginTransaction, db);
    var rollbackTransaction = R.partial(Client.rollbackTransaction, db);

    return ensureJournal()
      .then(beginTransaction)
      .return(migrations)
      .each(function(migration) {
        return Files.readUpSQL(migration).then(function(sql) {
          var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
          var appendJournal = R.partial(
            Client.appendJournal,
            db,
            journalTable,
            'apply',
            migration.id,
            migration.name
          );

          return runMigrationSQL().then(appendJournal);
        });
      })
      .finally(rollbackTransaction);
  });
}

module.exports = {
  readJournal: R.curry(readJournal),
  applyEach: R.curry(applyEach),
  applyAll: R.curry(applyAll),
  applyDry: R.curry(applyDry)
};
