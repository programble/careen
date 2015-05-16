'use strict';

import * as assert from 'assert';

import { DEFAULTS } from '../../lib/config/index';
import { version } from '../../lib/command/index';

describe('Command version', function() {
  it('returns string', () =>
    version(DEFAULTS).then(s => assert.equal(typeof s, 'string'))
  );
});
