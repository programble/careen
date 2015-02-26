'use strict';

var Promise = require('bluebird');

var Suite = require('./suite');

Suite({
  prettyName: 'SQLite3',
  skip: process.env.TEST_SKIP_SQL_SQLITE3,
  Implementation: require('../../lib/sql/sqlite3'),
  createDatabase: function() {
    return Promise.resolve({filename: ':memory:'});
  },
  dropDatabase: function(configuration) {
    return Promise.resolve();
  }
});
