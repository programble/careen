'use strict';

var R = require('ramda');
var Promise = require('bluebird');

function connect(configuration) {
  return Promise.resolve({
    live: {tables: {}},
    transaction: null,
    rollback: null
  });
}

function disconnect(db) {
  return Promise.resolve();
}

function beginTransaction(db) {
  db.rollback = R.clone(db.live);
  db.transaction = R.clone(db.live);
  return Promise.resolve();
}

function commitTransaction(db) {
  db.live = db.transaction;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

function rollbackTransaction(db) {
  db.live = db.rollback;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

function ensureJournal(db, tableName) {
  var tables = (db.transaction || db.live).tables;
  if (!tables[tableName]) tables[tableName] = [];
  return Promise.resolve();
}

function appendJournal(db, tableName, operation, migrationID, migrationName) {
  var journal = (db.transaction || db.live).tables.journal;
  journal.push({
    timestamp: new Date(),
    operation: operation,
    migrationID: migrationID,
    migrationName: migrationName
  });
  return Promise.resolve();
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction,
  ensureJournal: R.curry(ensureJournal),
  appendJournal: R.curry(appendJournal)
};
