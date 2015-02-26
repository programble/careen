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
};

function disconnect(db) {
  return db.closeAsync();
};

function ensureMigrationsTable(tableName, db) {
  var sql = Hemp(' ', null, ';')
    ('CREATE TABLE IF NOT EXISTS', tableName, '(')
      ('timestamp INTEGER NOT NULL,')
      ('migration_id INTEGER NOT NULL,')
      ('migration_name TEXT NOT NULL,')
      ('operation TEXT NOT NULL')
    (')');
  return db.runAsync(sql.toString());
};

module.exports = {
  connect: connect,
  disconnect: disconnect,
  ensureMigrationsTable: R.curry(ensureMigrationsTable)
};
