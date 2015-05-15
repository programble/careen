'use strict';

import assert = require('assert');

import config = require('../../lib/config/index');

describe('Config defaults', function() {
  describe('commands create idGenerator', function() {
    it('succeeds', () => config.DEFAULTS.commands.create.idGenerator());

    describe('multiple calls', function() {
      let firstID: string;
      let secondID: string;

      before(function(done) {
        firstID = config.DEFAULTS.commands.create.idGenerator();
        setTimeout(function() {
          secondID = config.DEFAULTS.commands.create.idGenerator();
          done();
        }, 5);
      });

      it('generates unique IDs', () => assert.notEqual(firstID, secondID));

      it('generates sorted IDs', () => assert(firstID < secondID));
    });
  });
});
