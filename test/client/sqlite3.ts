'use strict';

import * as Promise from 'bluebird';

import suite from './suite';
import * as sqlite3 from '../../lib/client/sqlite3';

suite<typeof sqlite3, sqlite3.Config>({
  prettyName: 'SQLite3',
  skip: process.env.TEST_SKIP_CLIENT_SQLITE3,
  client: sqlite3,
  createDatabase: () => Promise.resolve({filename: ':memory:'}),
  dropDatabase: () => Promise.resolve()
});
