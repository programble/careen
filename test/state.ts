'use strict';

import assert = require('assert');

import client = require('../lib/client/index');
import state = require('../lib/state');

var migration = {
  id: '1',
  name: 'test',
  split: false,
  path: 'migrations/1.test.sql'
};

var journalEntries = {
  apply: {
    timestamp: new Date(),
    operation: client.Operation.apply,
    migrationID: migration.id,
    migrationName: migration.name
  },
  revert: {
    timestamp: new Date(),
    operation: client.Operation.revert,
    migrationID: migration.id,
    migrationName: migration.name
  },
  invalid: {
    timestamp: new Date(),
    operation: <client.Operation> undefined,
    migrationID: migration.id,
    migrationName: migration.name
  }
};

describe('State', function() {
  describe('getMigrationStates', function() {
    describe('with nothing', function() {
      it('returns empty object', () =>
        assert.deepEqual(state.getMigrationStates([], []), {})
      );
    });

    describe('with journal entry without migration', function() {
      it('returns missing state', function() {
        var states = state.getMigrationStates([], [journalEntries.apply]);
        assert.equal(states[migration.id], state.State.missing);
      });
    });

    describe('with migration', function() {
      describe('without journal entries', function() {
        it('returns pending state', function() {
          var states = state.getMigrationStates([migration], []);
          assert.equal(states[migration.id], state.State.pending);
        });
      });

      describe('with apply journal entry', function() {
        it('returns applied state', function() {
          var states = state.getMigrationStates([migration], [journalEntries.apply]);
          assert.equal(states[migration.id], state.State.applied);
        });
      });

      describe('with apply and revert journal entries', function() {
        it('returns reverted state', function() {
          var states = state.getMigrationStates(
            [migration], [journalEntries.apply, journalEntries.revert]
          );
          assert.equal(states[migration.id], state.State.reverted);
        });
      });

      describe('with apply, revert, apply journal entries', function() {
        it('returns applied state', function() {
          var states = state.getMigrationStates(
            [migration],
            [journalEntries.apply, journalEntries.revert, journalEntries.apply]
          );
          assert.equal(states[migration.id], state.State.applied);
        });
      });

      describe('with invalid journal entry operation', function() {
        it('throws InvalidJournalOperationError', () =>
          assert.throws(
            () => state.getMigrationStates([migration], [journalEntries.invalid]),
            (error: any) => error instanceof state.InvalidJournalOperationError
          )
        );
      });
    });
  });
});
