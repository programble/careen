'use strict';

var ChildProcess = require('child_process');

var Promise = require('bluebird');
var exec = Promise.promisify(ChildProcess.exec);

var Suite = require('./suite');

var databaseID = 1;

Suite({
  prettyName: 'PostgreSQL',
  skip: process.env.TEST_SKIP_CLIENT_POSTGRESQL,
  Client: require('../../lib/clients/postgresql'),
  createDatabase: function() {
    var configuration = {database: 'careen-test-' + databaseID};
    databaseID++;
    return exec('createdb ' + configuration.database).return(configuration);
  },
  dropDatabase: function(configuration) {
    return exec('dropdb ' + configuration.database);
  }
});
