'use strict';

import * as Promise from 'bluebird';

import suite from './suite';
import * as dummy from '../../lib/client/dummy';

suite<typeof dummy, dummy.Config>({
  prettyName: 'Dummy',
  skip: false,
  client: dummy,
  createDatabase: () => Promise.resolve({}),
  dropDatabase: () => Promise.resolve()
});
