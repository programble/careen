'use strict';

var Promise = require('bluebird');

var Suite = require('./suite');

Suite({
  prettyName: 'SQLite3',
  skip: process.env.TEST_SKIP_CLIENT_SQLITE3,
  Client: require('../../lib/clients/sqlite3'),
  createDatabase: function() {
    return Promise.resolve({filename: ':memory:'});
  },
  dropDatabase: function() {
    return Promise.resolve();
  }
});
