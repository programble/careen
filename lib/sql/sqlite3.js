'use strict';

/**
 * SQLite3 database interface implementation.
 * @module SQLite3
 * @implements SQLDatabase
 */

var R = require('ramda');
var Promise = require('bluebird');
var Hemp = require('hemp');

var SQLite3 = require('sqlite3');
Promise.promisifyAll(SQLite3.Database.prototype);

function connect(configuration) {
  return new Promise(function(resolve, reject) {
    var db = new SQLite3.Database(configuration.filename);
    db.once('error', reject);
    db.once('open', function() { resolve(db); });
  });
}

function disconnect(db) {
  return db.closeAsync();
}

function beginTransaction(db) {
  return db.runAsync('BEGIN;');
}

function commitTransaction(db) {
  return db.runAsync('COMMIT;');
}

function rollbackTransaction(db) {
  return db.runAsync('ROLLBACK;');
}

function ensureJournal(db, tableName) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TEXT NOT NULL,')
      ('operation TEXT NOT NULL,')
      ('migration_id TEXT NOT NULL,')
      ('migration_name TEXT NOT NULL')
    (')');
  return db.runAsync(sql.toString());
}

function appendJournal(db, tableName, operation, migrationID, migrationName) {
  var sql = Hemp(' ', null, ';')
    ('INSERT INTO', tableName)
    ('(timestamp, operation, migration_id, migration_name)')
    ('VALUES')
    ("(datetime('now'), ?, ?, ?)");
  return db.runAsync(sql.toString(), [operation, migrationID, migrationName]);
}

function readJournal(db, tableName) {
  var sql = Hemp(' ', null, ';')
    ('SELECT * FROM', tableName)
    ('ORDER BY timestamp');
  return db.allAsync(sql.toString())
    .map(function(row) {
      return {
        timestamp: new Date(row.timestamp),
        operation: row.operation,
        migrationID: row.migration_id,
        migrationName: row.migration_name
      };
    });
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction,
  ensureJournal: R.curry(ensureJournal),
  appendJournal: R.curry(appendJournal),
  readJournal: R.curry(readJournal)
};
