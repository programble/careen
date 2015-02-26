'use strict';

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

function runQuery(db, sql) {
  var query = db.query(sql);
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

function ensureJournal(tableName, db) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TIMESTAMP PRIMARY KEY,')
      ('operation TEXT NOT NULL,')
      ('migration_id TEXT NOT NULL,')
      ('migration_name TEXT NOT NULL')
    (')');
  return runQuery(db, sql.toString());
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction,
  ensureJournal: R.curry(ensureJournal)
};
