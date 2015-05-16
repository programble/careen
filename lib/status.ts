'use strict';

import * as R from 'ramda';

import StandardError from './standard-error';
import { JournalEntry, Operation } from './client/index';
import { Migration } from './files';

export enum State {
  pending,
  applied,
  reverted,
  missing
}

export interface MigrationState {
  migrationID: string;
  migrationName: string;
  state: State;
}

export class InvalidJournalOperationError extends StandardError {
  constructor(public operation: any) {
    super(`Invalid journal entry operation: ${operation}`);
  }
}

export function getMigrationStates(
  migrations: Migration[], journalEntries: JournalEntry[]
): MigrationState[] {
  let migrationIDSet: { [id: string]: boolean } = {};
  let states: { [id: string]: MigrationState } = {};

  R.forEach(function(migration) {
    migrationIDSet[migration.id] = true;
    states[migration.id] = {
      migrationID: migration.id,
      migrationName: migration.name,
      state: State.pending
    };
  }, migrations);

  R.forEach(function(entry) {
    if (!migrationIDSet[entry.migrationID]) {
      states[entry.migrationID] = {
        migrationID: entry.migrationID,
        migrationName: entry.migrationName,
        state: State.missing
      };
    } else if (entry.operation === Operation.apply) {
      states[entry.migrationID].state = State.applied;
    } else if (entry.operation === Operation.revert) {
      states[entry.migrationID].state = State.reverted;
    } else {
      throw new InvalidJournalOperationError(entry.operation);
    }
  }, journalEntries);

  return R.sortBy(s => s.migrationID, R.values(states));
}
