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
 * Create an each runner function.
 * @param {string} operation - Passed to {@link Client.appendJournal}
 * @param {function} readSQL - {@link module:Files.readUpSQL} or {@link
 * module:Files.readDownSQL}
 * @returns {function}
 */
function eachRunner(operation, readSQL) {
  return function (client, configuration, journalTable, migrations) {
    var Client = requireClient(client);
    return Promise.using(useConnection(Client, configuration), function(db) {
      var ensureJournal = R.partial(Client.ensureJournal, db, journalTable);
      var beginTransaction = R.partial(Client.beginTransaction, db);
      var rollbackTransaction = R.partial(Client.rollbackTransaction, db);
      var commitTransaction = R.partial(Client.commitTransaction, db);

      return ensureJournal()
        .return(migrations)
        .each(function(migration) {
          return readSQL(migration).then(function(sql) {
            var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
            var appendJournal = R.partial(
              Client.appendJournal,
              db,
              journalTable,
              operation,
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
  };
}

/**
 * Create an all runner function.
 * @param {string} operation - Passed to {@link Client.appendJournal}
 * @param {function} readSQL - {@link module:Files.readUpSQL} or {@link
 * module:Files.readDownSQL}
 * @returns {function}
 */
function allRunner(operation, readSQL) {
  return function(client, configuration, journalTable, migrations) {
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
          return readSQL(migration).then(function(sql) {
            var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
            var appendJournal = R.partial(
              Client.appendJournal,
              db,
              journalTable,
              operation,
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
  };
}

/**
 * Create a dry runner function.
 * @param {string} operation - Passed to {@link Client.appendJournal}
 * @param {function} readSQL - {@link module:Files.readUpSQL} or {@link
 * module:Files.readDownSQL}
 * @returns {function}
 */
function dryRunner(operation, readSQL) {
  return function(client, configuration, journalTable, migrations) {
    var Client = requireClient(client);
    return Promise.using(useConnection(Client, configuration), function(db) {
      var ensureJournal = R.partial(Client.ensureJournal, db, journalTable);
      var beginTransaction = R.partial(Client.beginTransaction, db);
      var rollbackTransaction = R.partial(Client.rollbackTransaction, db);

      return ensureJournal()
        .then(beginTransaction)
        .return(migrations)
        .each(function(migration) {
          return readSQL(migration).then(function(sql) {
            var runMigrationSQL = R.partial(Client.runMigrationSQL, db, sql);
            var appendJournal = R.partial(
              Client.appendJournal,
              db,
              journalTable,
              operation,
              migration.id,
              migration.name
            );

            return runMigrationSQL().then(appendJournal);
          });
        })
        .finally(rollbackTransaction);
    });
  };
}

/**
 * Apply migrations each in a transaction. Stop if an error occurs. Curried.
 * @alias module:Runner.applyEach
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to apply
 * @returns {Promise.<*>}
 */
function applyEach(client, configuration, journalTable, migrations) {
  return eachRunner('apply', Files.readUpSQL)
    (client, configuration, journalTable, migrations);
}

/**
 * Apply migrations all in a transaction. Rollback all migrations if an error
 * occurs. Curried.
 *
 * @alias module:Runner.applyAll
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to apply
 * @returns {Promise.<*>}
 */
function applyAll(client, configuration, journalTable, migrations) {
  return allRunner('apply', Files.readUpSQL)
    (client, configuration, journalTable, migrations);
}

/**
 * Apply migrations in a transaction then rollback. Curried.
 * @alias module:Runner.applyDry
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to apply
 * @returns {Promise.<*>}
 */
function applyDry(client, configuration, journalTable, migrations) {
  return dryRunner('apply', Files.readUpSQL)
    (client, configuration, journalTable, migrations);
}

/**
 * Revert migrations each in a transaction. Stop if an error occurs. Curried.
 * @alias module:Runner.revertEach
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to revert
 * @returns {Promise.<*>}
 */
function revertEach(client, configuration, journalTable, migrations) {
  return eachRunner('revert', Files.readDownSQL)
    (client, configuration, journalTable, migrations);
}

/**
 * Revert migrations all in a transaction. Rollback all migrations if an error
 * occurs. Curried.
 *
 * @alias module:Runner.revertAll
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to revert
 * @returns {Promise.<*>}
 */
function revertAll(client, configuration, journalTable, migrations) {
  return allRunner('revert', Files.readDownSQL)
    (client, configuration, journalTable, migrations);
}

/**
 * Revert migrations in a transaction then rollback. Curried.
 * @alias module:Runner.revertDry
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @param {module:Files.Migration[]} migrations - Migrations to revert
 * @returns {Promise.<*>}
 */
function revertDry(client, configuration, journalTable, migrations) {
  return dryRunner('revert', Files.readDownSQL)
    (client, configuration, journalTable, migrations);
}

module.exports = {
  readJournal: R.curry(readJournal),
  applyEach: R.curry(applyEach),
  applyAll: R.curry(applyAll),
  applyDry: R.curry(applyDry),
  revertEach: R.curry(revertEach),
  revertAll: R.curry(revertAll),
  revertDry: R.curry(revertDry)
};
