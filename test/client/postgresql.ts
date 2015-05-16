'use strict';

import { exec as execNode } from 'child_process';

import * as Promise from 'bluebird';
let exec = Promise.promisify(execNode);

import suite from './suite';
import * as postgresql from '../../lib/client/postgresql';

let databaseID = 1;

suite<typeof postgresql, postgresql.Config>({
  prettyName: 'PostgreSQL',
  skip: process.env.TEST_SKIP_CLIENT_POSTGRESQL,
  client: postgresql,

  createDatabase: function() {
    let config = {database: 'careen-test-' + databaseID};
    databaseID++;
    return exec(`createdb ${config.database}`).return(config);
  },

  dropDatabase: function(config) {
    return exec(`dropdb ${config.database}`);
  }
});
