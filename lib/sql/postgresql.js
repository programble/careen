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

function ensureMigrationsTable(tableName, db) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp TIMESTAMP PRIMARY KEY,')
      ('migration_id INTEGER NOT NULL,')
      ('migration_name TEXT NOT NULL,')
      ('operation TEXT NOT NULL')
    (')');
  var query = db.query(sql.toString());
  return new Promise(function(resolve, reject) {
    query.once('error', reject);
    query.once('end', resolve);
  });
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  ensureMigrationsTable: R.curry(ensureMigrationsTable)
};
