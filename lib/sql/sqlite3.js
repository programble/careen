'use strict';

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

function ensureMigrationsTable(tableName, db) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TEXT PRIMARY KEY,')
      ('migration_id TEXT NOT NULL,')
      ('migration_name TEXT NOT NULL,')
      ('operation TEXT NOT NULL')
    (')');
  return db.runAsync(sql.toString());
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

module.exports = {
  connect: connect,
  disconnect: disconnect,
  ensureMigrationsTable: R.curry(ensureMigrationsTable),
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction
};
