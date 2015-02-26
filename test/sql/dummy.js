'use strict';

var Promise = require('bluebird');

var Suite = require('./suite');

Suite({
  prettyName: 'Dummy',
  skip: false,
  Implementation: require('../../lib/sql/dummy'),
  createDatabase: function() {
    return Promise.resolve();
  },
  dropDatabase: function(configuration) {
    return Promise.resolve();
  }
});
