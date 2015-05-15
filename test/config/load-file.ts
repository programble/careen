'use strict';

import assert = require('assert');

import mockFS = require('mock-fs');

import config = require('../../lib/config/index');

describe('Config loadFile', function() {
  let testDefaults: config.Config;

  before(() =>
    testDefaults = config.loadObject({client: {journalTable: 'test'}})
  );

  describe('with JSON file', function() {
    before(() =>
      mockFS({'careen.json': '{"command":"journal"}'})
    );

    it('loads configuration', function() {
      let testConfig = config.loadFile('careen.json');
      assert.equal(testConfig.command, config.Command.journal);
    });

    describe('with explicit defaults', function() {
      it('inherits defaults', function() {
        let testConfig = config.loadFile('careen.json', testDefaults);
        assert.equal(testConfig.client.journalTable, 'test');
      });
    });

    after(mockFS.restore);
  });

  describe('with JS file', function() {
    before(() =>
      mockFS({
        'careen.js': `
          module.exports = {
            commands: {
              create: {
                idGenerator: function() { return '123'; }
              }
            }
          }
        `
      })
    );

    it('loads configuration', function() {
      let testConfig = config.loadFile('careen.js');
      assert.equal(testConfig.commands.create.idGenerator(), '123');
    });

    describe('with explicit defaults', function() {
      it('inherits defaults', function() {
        let testConfig = config.loadFile('careen.js', testDefaults);
        assert.equal(testConfig.client.journalTable, 'test');
      });
    });

    after(mockFS.restore);
  });
});
