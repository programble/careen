'use strict';

/**
 * PostgreSQL database interface implementation.
 * @module PostgreSQL
 * @implements SQLDatabase
 */

var R = require('ramda');
var Promise = require('bluebird');
var Hemp = require('hemp');

var PostgreSQL = require('pg');
Promise.promisifyAll(PostgreSQL.Client.prototype);

function connect(configuration) {
  var db = configuration.url
    ? new PostgreSQL.Client(configuration.url)
    : new PostgreSQL.Client(configuration);
  return db.connectAsync().return(db);
}

function disconnect(db) {
  return Promise.resolve(db.end());
}

function runQuery(db, sql, values) {
  var query = db.query(sql, values);
  query.on('row', function(row, result) {
    result.addRow(row);
  });
  return new Promise(function(resolve, reject) {
    query.once('error', reject);
    query.once('end', resolve);
  });
}

function beginTransaction(db) {
  return runQuery(db, 'BEGIN;');
}

function commitTransaction(db) {
  return runQuery(db, 'COMMIT;');
}

function rollbackTransaction(db) {
  return runQuery(db, 'ROLLBACK;');
}

function ensureJournal(db, tableName) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TIMESTAMP PRIMARY KEY,')
      ('operation TEXT NOT NULL,')
      ('migration_id TEXT NOT NULL,')
      ('migration_name TEXT NOT NULL')
    (')');
  return runQuery(db, sql.toString());
}

function appendJournal(db, tableName, operation, migrationID, migrationName) {
  var sql = Hemp(' ', null, ';')
    ('INSERT INTO', tableName)
    ('(timestamp, operation, migration_id, migration_name)')
    ('VALUES')
    ('(now(), $1, $2, $3)');
  return runQuery(db, sql.toString(), [operation, migrationID, migrationName]);
}

function readJournal(db, tableName) {
  var sql = Hemp(' ', null, ';')
    ('SELECT * FROM', tableName)
    ('ORDER BY timestamp');
  return runQuery(db, sql.toString())
    .get('rows')
    .map(function(row) {
      return {
        timestamp: new Date(row.timestamp),
        operation: row.operation,
        migrationID: row.migration_id,
        migrationName: row.migration_name
      };
    });
}

function runMigrationSQL(db, sql) {
  return runQuery(db, sql);
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
