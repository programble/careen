'use strict';

import { DEFAULTS } from '../../lib/config/index';
import { help } from '../../lib/command/index';

describe('Command help', function() {
  it('succeeds', () => help(DEFAULTS));
});
