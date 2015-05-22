'use strict';

import * as assert from 'assert';

import * as client from '../lib/client/index';
import * as status from '../lib/status';

const migration = {
  id: '1',
  name: 'test',
  split: false,
  path: 'migrations/1.test.sql'
};

const journalEntries = {
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

describe('Status', function() {
  describe('isApplicable', function() {
    it('succeeds', () =>
      status.isApplicable({
        migrationID: '123',
        migrationName: 'test',
        state: status.State.pending
      })
    );
  });

  describe('isRevertable', function() {
    it('succeeds', () =>
      status.isRevertable({
        migrationID: '123',
        migrationName: 'test',
        state: status.State.applied
      })
    );
  });

  describe('getMigrationStates', function() {
    describe('with nothing', function() {
      it('returns empty array', () =>
        assert.deepEqual(status.getMigrationStates([], []), [])
      );
    });

    describe('with journal entry without migration', function() {
      it('returns missing state', function() {
        let [state] = status.getMigrationStates([], [journalEntries.apply]);
        assert.equal(state.migrationID, journalEntries.apply.migrationID);
        assert.equal(state.migrationName, journalEntries.apply.migrationName);
        assert.equal(state.state, status.State.missing);
      });
    });

    describe('with migration', function() {
      describe('without journal entries', function() {
        it('returns pending state', function() {
          let [state] = status.getMigrationStates([migration], []);
          assert.equal(state.migrationID, migration.id);
          assert.equal(state.migrationName, migration.name);
          assert.equal(state.state, status.State.pending);
        });
      });

      describe('with apply journal entry', function() {
        it('returns applied state', function() {
          let [state] = status.getMigrationStates([migration], [journalEntries.apply]);
          assert.equal(state.migrationID, migration.id);
          assert.equal(state.migrationName, migration.name);
          assert.equal(state.state, status.State.applied);
        });
      });

      describe('with apply and revert journal entries', function() {
        it('returns reverted state', function() {
          let [state] = status.getMigrationStates(
            [migration], [journalEntries.apply, journalEntries.revert]
          );
          assert.equal(state.migrationID, migration.id);
          assert.equal(state.migrationName, migration.name);
          assert.equal(state.state, status.State.reverted);
        });
      });

      describe('with apply, revert, apply journal entries', function() {
        it('returns applied state', function() {
          let [state] = status.getMigrationStates(
            [migration],
            [journalEntries.apply, journalEntries.revert, journalEntries.apply]
          );
          assert.equal(state.migrationID, migration.id);
          assert.equal(state.migrationName, migration.name);
          assert.equal(state.state, status.State.applied);
        });
      });

      describe('with invalid journal entry operation', function() {
        it('throws InvalidJournalOperationError', () =>
          assert.throws(
            () => status.getMigrationStates([migration], [journalEntries.invalid]),
            (error: any) => error instanceof status.InvalidJournalOperationError
          )
        );
      });
    });
  });
});
