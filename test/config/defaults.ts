'use strict';

import * as assert from 'assert';

import { DEFAULTS } from '../../lib/config/index';

describe('Config defaults', function() {
  describe('commands create idGenerator', function() {
    it('succeeds', () => DEFAULTS.commands.create.idGenerator());

    describe('multiple calls', function() {
      let firstID: string;
      let secondID: string;

      before(function(done) {
        firstID = DEFAULTS.commands.create.idGenerator();
        setTimeout(function() {
          secondID = DEFAULTS.commands.create.idGenerator();
          done();
        }, 5);
      });

      it('generates unique IDs', () => assert.notEqual(firstID, secondID));

      it('generates sorted IDs', () => assert(firstID < secondID));
    });
  });
});
