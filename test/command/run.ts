'use strict';

import * as assert from 'assert';

import * as Promise from 'bluebird';
import * as sinon from 'sinon';

import { loadObject } from '../../lib/config/index';
import * as command from '../../lib/command/index';
import * as apply from '../../lib/command/apply';
import * as revert from '../../lib/command/revert';
import * as status from '../../lib/command/status';
import * as journal from '../../lib/command/journal';
import * as migrations from '../../lib/command/migrations';
import * as create from '../../lib/command/create';
import * as help from '../../lib/command/help';
import * as version from '../../lib/command/version';

describe('Command run', () => {
  describe('apply', () => {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(apply, 'default').returns(Promise.resolve('')));

    it('calls apply', () => {
      command.run(loadObject({command: 'apply'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

  describe('revert', () => {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(revert, 'default').returns(Promise.resolve('')));

    it('calls revert', () => {
      command.run(loadObject({command: 'revert'}));
      assert.equal(stub.callCount, 1);
    });
  });

  describe('status', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(status, 'default').returns(Promise.resolve('')));

    it('calls status', function() {
      command.run(loadObject({command: 'status'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

  describe('journal', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(journal, 'default').returns(Promise.resolve('')));

    it('calls journal', function() {
      command.run(loadObject({command: 'journal'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

  describe('migrations', function() {
    let stub: sinon.Stub;
    before(() => stub = sinon.stub(migrations, 'default').returns(Promise.resolve('')));

    it('calls migrations', function() {
      command.run(loadObject({command: 'migrations'}));
      assert.equal(stub.callCount, 1);
    });

    after(() => stub.restore());
  });

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
