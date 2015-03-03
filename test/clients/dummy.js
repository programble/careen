'use strict';

var Promise = require('bluebird');

var Suite = require('./suite');

Suite({
  prettyName: 'Dummy',
  skip: false,
  Client: require('../../lib/clients/dummy'),
  createDatabase: function() { return Promise.resolve(); },
  dropDatabase: function() { return Promise.resolve(); }
});
