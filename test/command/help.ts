'use strict';

import { DEFAULTS } from '../../lib/config/index';
import { help } from '../../lib/command/index';

describe('Help command', function() {
  it('succeeds', () => help(DEFAULTS));
});
