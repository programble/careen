'use strict';

var assert = require('assert');

var Promise = require('bluebird');
var Sinon = require('sinon');

var Runner = require('../lib/runner');
var Dummy = require('../lib/clients/dummy');

describe('Runner', function() {
  describe('readJournal', function() {
    before(function() {
      Sinon.spy(Dummy, 'connect');
      Sinon.spy(Dummy, 'ensureJournal');
      Sinon.spy(Dummy, 'readJournal');
      Sinon.spy(Dummy, 'disconnect');
    });
    after(function() {
      Dummy.connect.restore();
      Dummy.ensureJournal.restore();
      Dummy.readJournal.restore();
      Dummy.disconnect.restore();
    });

    it('succeeds', function() {
      return this.journal = Runner.readJournal('dummy', {}, 'journal');
    });
    it('calls connect', function() {
      assert(Dummy.connect.calledOnce);
    });
    it('calls ensureJournal', function() {
      assert(Dummy.ensureJournal.calledOnce);
    });
    it('calls readJournal', function() {
      assert(Dummy.readJournal.calledOnce);
    });
    it('calls disconnect', function() {
      assert(Dummy.disconnect.calledOnce);
    });
    it('returns journal', function() {
      return Promise.join(
        this.journal,
        Dummy.readJournal.firstCall.returnValue,
        assert.equal
      );
    });
  });
});
