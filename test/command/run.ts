'use strict';

import * as assert from 'assert';

import * as Promise from 'bluebird';
import * as sinon from 'sinon';

import { loadObject } from '../../lib/config/index';
import * as command from '../../lib/command/index';
import * as create from '../../lib/command/create';
import * as help from '../../lib/command/help';
import * as version from '../../lib/command/version';

describe('Command run', function() {
  describe('create', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(create, 'default').returns(Promise.resolve('')));

    it('calls create', function() {
      command.run(loadObject({command: 'create'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

  describe('help', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(help, 'default').returns(Promise.resolve('')));

    it('calls help', function() {
      command.run(loadObject({command: 'help'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

  describe('version', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(version, 'default').returns(Promise.resolve('')));

    it('calls version', function() {
      command.run(loadObject({command: 'version'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });
});
