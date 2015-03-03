'use strict';

/**
 * Interface of SQL database clients. Implemented in this file as dummy
 * functions that store state in a plain object instead of connecting to a
 * database.
 *
 * @interface Client
 */

var R = require('ramda');
var Promise = require('bluebird');

/**
 * Database connection, returned from {@link Client.connect}.
 * @typedef {*} Client~Connection
 */

/**
 * Connect to a database.
 * @alias Client.connect
 * @param {Object} configuration - Connection configuration
 * @returns {Promise.<Client~Connection>} Database connection
 */
function connect(configuration) {
  return Promise.resolve({
    live: {tables: {}, sql: []},
    transaction: null,
    rollback: null
  });
}

/**
 * Disconnect from a database.
 * @alias Client.disconnect
 * @param {Client~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function disconnect(db) {
  return Promise.resolve();
}

/**
 * Begin a transaction.
 * @alias Client.beginTransaction
 * @param {Client~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function beginTransaction(db) {
  db.rollback = R.clone(db.live);
  db.transaction = R.clone(db.live);
  return Promise.resolve();
}

/**
 * Commit the current transaction.
 * @alias Client.commitTransaction
 * @param {Client~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function commitTransaction(db) {
  db.live = db.transaction;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

/**
 * Rollback the current transaction.
 * @alias Client.rollbackTransaction
 * @param {Client~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function rollbackTransaction(db) {
  db.live = db.rollback;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

/**
 * Create the migration journal table if it does not already exist. Curried.
 * @alias Client.ensureJournal
 * @param {Client~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @returns {Promise.<*>}
 */
function ensureJournal(db, tableName) {
  var tables = (db.transaction || db.live).tables;
  if (!tables[tableName]) tables[tableName] = [];
  return Promise.resolve();
}

/**
 * Append an entry to the migration journal table. Curried.
 * @alias Client.appendJournal
 * @param {Client~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @param {string} operation - Migration operation type
 * @param {string} migrationID - ID of the migration
 * @param {string} migrationName - Name of the migration
 * @returns {Promise.<*>}
 */
function appendJournal(db, tableName, operation, migrationID, migrationName) {
  var journal = (db.transaction || db.live).tables[tableName];
  journal.push({
    timestamp: new Date(),
    operation: operation,
    migrationID: migrationID,
    migrationName: migrationName
  });
  return Promise.resolve();
}

/**
 * Migration journal entry.
 * @typedef {Object} Client.JournalEntry
 * @property {Date} timestamp - Timestamp the entry was written
 * @property {string} operation - Migration operation type
 * @property {string} migrationID - ID of the migration
 * @property {string} migrationName - Name of the migration
 */

/**
 * Read entries of the migration journal table, in the order they were added.
 * Curried.
 *
 * @alias Client.readJournal
 * @param {Client~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @returns {Promise.<Client.JournalEntry[]>}
 */
function readJournal(db, tableName) {
  return Promise.resolve((db.transaction || db.live).tables[tableName]);
}

/**
 * Run migration SQL statements. Curried.
 * @alias Client.runMigrationSQL
 * @param {Client~Connection} db - Database connection
 * @param {string} sql - Migration SQL statements
 * @returns {Promise.<*>}
 */
function runMigrationSQL(db, sql) {
  return Promise.resolve((db.transaction || db.live).sql.push(sql));
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction,
  ensureJournal: R.curry(ensureJournal),
  appendJournal: R.curry(appendJournal),
  readJournal: R.curry(readJournal),
  runMigrationSQL: R.curry(runMigrationSQL)
};
