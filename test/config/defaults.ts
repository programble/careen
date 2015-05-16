'use strict';

import * as assert from 'assert';

import { DEFAULTS } from '../../lib/config/index';

describe('Config defaults', function() {
  describe('commands create generateID', function() {
    it('succeeds', () => DEFAULTS.commands.create.generateID());

    describe('multiple calls', function() {
      let firstID: string;
      let secondID: string;

      before(function(done) {
        firstID = DEFAULTS.commands.create.generateID();
        setTimeout(function() {
          secondID = DEFAULTS.commands.create.generateID();
          done();
        }, 5);
      });

      it('generates unique IDs', () => assert.notEqual(firstID, secondID));

      it('generates sorted IDs', () => assert(firstID < secondID));
    });
  });
});
