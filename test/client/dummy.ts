'use strict';

import Promise = require('bluebird');

import suite = require('./suite');
import dummy = require('../../lib/client/dummy');

suite({
  prettyName: 'Dummy',
  skip: false,
  client: dummy,
  createDatabase: () => Promise.resolve({}),
  dropDatabase: () => Promise.resolve()
});
