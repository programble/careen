'use strict';

import * as assert from 'assert';

import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as sinon from 'sinon';
import * as mockFS from 'mock-fs';

import StandardError from '../lib/standard-error';
import * as config from '../lib/config/index';
import * as command from '../lib/command/index';
import main from '../bin/_careen';

// Reject stubbed promises with this to prevent console.log from being called.
class PreventConsoleLog extends StandardError {}

describe('Main', function() {
  let loadFileSpy: sinon.Spy;
  let loadArgsSpy: sinon.Spy;
  let runStub: sinon.Stub;

  before(function() {
    loadFileSpy = sinon.spy(config, 'loadFile');
    loadArgsSpy = sinon.spy(config, 'loadArgs');
    runStub = sinon.stub(command, 'run', () =>
      Promise.reject(new PreventConsoleLog('test'))
    );
  });

  after(function() {
    loadFileSpy.restore();
    loadArgsSpy.restore();
    runStub.restore();
  });

  describe('without configuration files', function() {
    before(() => mockFS({}));

    it('succeeds', () =>
      main(['node', 'careen']).catch(PreventConsoleLog, R.T)
    );

    it('does not call loadFile', () =>
      assert.equal(loadFileSpy.callCount, 0)
    );
    it('calls loadArgs', () =>
      assert.equal(loadArgsSpy.callCount, 1)
    );
    it('calls run', () =>
      assert.equal(runStub.callCount, 1)
    );

    after(mockFS.restore);
  });

  describe('with JavaScript configuration file', function() {
    before(() => mockFS({'careen.js': 'module.exports = {}'}));

    before(function() {
      loadFileSpy.reset();
      loadArgsSpy.reset();
      runStub.reset();
    });

    it('succeeds', () =>
      main(['node', 'careen']).catch(PreventConsoleLog, R.T)
    );

    it('calls loadFile', function() {
      assert.equal(loadFileSpy.callCount, 1);
      assert.equal(loadFileSpy.firstCall.args[0], 'careen.js');
    });
    it('calls loadArgs', () =>
      assert.equal(loadArgsSpy.callCount, 1)
    );
    it('calls run', () =>
      assert.equal(runStub.callCount, 1)
    );

    after(mockFS.restore);
  });

  describe('with JSON configuration file', function() {
    before(() => mockFS({'careen.json': '{}'}));

    before(function() {
      loadFileSpy.reset();
      loadArgsSpy.reset();
      runStub.reset();
    });

    it('succeeds', () =>
      main(['node', 'careen']).catch(PreventConsoleLog, R.T)
    );

    it('calls loadFile', function() {
      assert.equal(loadFileSpy.callCount, 1);
      assert.equal(loadFileSpy.firstCall.args[0], 'careen.json');
    });
    it('calls loadArgs', () =>
      assert.equal(loadArgsSpy.callCount, 1)
    );
    it('calls run', () =>
      assert.equal(runStub.callCount, 1)
    );

    after(mockFS.restore);
  });
});
