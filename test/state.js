'use strict';

var assert = require('assert');

var Runner = require('../lib/runner');
var State = require('../lib/state');

var migration = {
  id: '1',
  name: 'test',
  split: false,
  path: 'migrations/1.test.sql'
};

var journalEntries = {
  apply: {
    timestamp: new Date(),
    operation: Runner.OPERATION.APPLY,
    migrationID: migration.id,
    migrationName: migration.name
  },
  revert: {
    timestamp: new Date(),
    operation: Runner.OPERATION.REVERT,
    migrationID: migration.id,
    migrationName: migration.name
  },
  invalid: {
    timestamp: new Date(),
    operation: 'invalid',
    migrationID: migration.id,
    migrationName: migration.name
  }
};

describe('State', function() {
  describe('getMigrationStates', function() {
    describe('with nothing', function() {
      it('returns empty object', function() {
        var states = State.getMigrationStates([], []);
        assert.deepEqual(states, {});
      });
    });

    describe('with journal entry without migration', function() {
      it('returns missing state', function() {
        var states = State.getMigrationStates([], [journalEntries.apply]);
        assert.equal(states[migration.id], State.STATE.MISSING);
      });
    });

    describe('with migration', function() {
      describe('without journal entries', function() {
        it('returns pending state', function() {
          var states = State.getMigrationStates([migration], []);
          assert.equal(states[migration.id], State.STATE.PENDING);
        });
      });

      describe('with apply journal entry', function() {
        it('returns applied state', function() {
          var states = State.getMigrationStates(
            [migration], [journalEntries.apply]
          );
          assert.equal(states[migration.id], State.STATE.APPLIED);
        });
      });

      describe('with apply and revert journal entries', function() {
        it('returns reverted state', function() {
          var states = State.getMigrationStates(
            [migration], [journalEntries.apply, journalEntries.revert]
          );
          assert.equal(states[migration.id], State.STATE.REVERTED);
        });
      });

      describe('with apply, revert, apply journal entries', function() {
        it('returns applied state', function() {
          var states = State.getMigrationStates(
            [migration], [journalEntries.apply, journalEntries.revert, journalEntries.apply]
          );
          assert.equal(states[migration.id], State.STATE.APPLIED);
        });
      });

      describe('with invalid journal entry operation', function() {
        it('throws InvalidJournalOperationError', function() {
          assert.throws(function() {
            State.getMigrationStates([migration], [journalEntries.invalid]);
          }, function(error) {
            return (error instanceof State.InvalidJournalOperationError);
          });
        });
      });
    });
  });
});
