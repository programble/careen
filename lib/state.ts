'use strict';

import R = require('ramda');
import SuperError = require('super-error');

import client = require('./client/index');
import files = require('./files');
import runner = require('./runner');

export enum State {
  pending,
  applied,
  reverted,
  missing
}

export var InvalidJournalOperationError = SuperError.subclass(
  'InvalidJournalOperationError',
  function(operation: any) {
    this.message = 'Invalid journal entry operation: ' + operation;
  }
);

export function getMigrationStates(
  migrations: files.Migration[], journalEntries: client.JournalEntry[]
): { [id: string]: State } {
  var initialStates = R.zipObj(
    R.map(migration => migration.id, migrations),
    R.times(R.always(State.pending), migrations.length)
  );

  return R.reduce(function(states, journalEntry) {
    if (!R.has(journalEntry.migrationID, states)) {
      return R.assoc(journalEntry.migrationID, State.missing, states);
    } else if (journalEntry.operation === client.Operation.apply) {
      return R.assoc(journalEntry.migrationID, State.applied, states);
    } else if (journalEntry.operation === client.Operation.revert) {
      return R.assoc(journalEntry.migrationID, State.reverted, states);
    } else {
      throw new InvalidJournalOperationError(journalEntry.operation);
    }
  }, initialStates, journalEntries);
}
