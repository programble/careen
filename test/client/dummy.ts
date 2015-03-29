'use strict';

import Promise = require('bluebird');

import suite = require('./suite');
import dummy = require('../../lib/client/dummy');

suite({
  prettyName: 'Dummy',
  skip: false,
  client: dummy,
  createDatabase: function(): Promise<{}> { return Promise.resolve({}); },
  dropDatabase: function() { return Promise.resolve(); }
});
