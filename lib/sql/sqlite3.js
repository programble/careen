'use strict';

var R = require('ramda');
var Promise = require('bluebird');

var sqlite3 = require('sqlite3');
Promise.promisifyAll(sqlite3.Database.prototype);

function connect(filename) {
  return new Promise(function(resolve, reject) {
    var db = new sqlite3.Database(filename, sqlite3.OPEN_READWRITE, function(err) {
      if (err) reject(err);
      else resolve(db);
    })
  });
}

function migrationsTableExists(tableName, db) {
  return db.getAsync([
    "SELECT * FROM sqlite_master",
    "WHERE type = 'table'",
      "AND name = ?"
  ].join(' '), [ tableName ]);
}

function createMigrationsTable(tableName, db) {
  return db.execAsync([
    "CREATE TABLE", tableName, "(",
      "timestamp INTEGER NOT NULL,",
      "name TEXT NOT NULL,",
      "direction TEXT NOT NULL,",
      "applied_at TEXT NOT NULL"
    ")"
  ].join(' '));
}

function readMigrationsTable(tableName, db) {
  return db.allAsync([
    "SELECT * FROM", tableName,
    "ORDER BY applied_at"
  ].join(' '));
}

function applyMigration(tableName, db, timestamp, name, direction, sql) {
  return db.execSync([
    "BEGIN;",
    sql,
    "INSERT INTO", tableName, "(timestamp, name, direction, applied_at)",
    "VALUES (?, ?, ?, datetime('now'));",
    "COMMIT;"
  ].join(' '), [ timestamp, name, direction ]);
}

function disconnect(db) {
  return db.closeAsync();
}

module.exports = {
  connect: connect,
  migrationsTableExists: R.curry(migrationsTableExists),
  createMigrationsTable: R.curry(createMigrationsTable),
  readMigrationsTable: R.curry(readMigrationsTable),
  applyMigration: R.curry(applyMigration),
  disconnect: disconnect
};
