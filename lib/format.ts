'use strict';

import { format } from 'util';
import * as path from 'path';

import * as chalk from 'chalk';

import { Operation, JournalEntry } from './client/index';
import { Migration } from './files';
import { State, MigrationState } from './status';

const colors = {
  apply: chalk.green,
  revert: chalk.magenta,
  pending: chalk.blue,
  missing: chalk.yellow
};

export function formatOperation(operation: Operation) {
  return (operation === Operation.apply)
    ? colors.apply('apply ')
    : colors.revert('revert');
}

export function formatJournalEntry(entry: JournalEntry) {
  return format(
    '%s %s %s %s\n',
    entry.timestamp.toISOString(),
    formatOperation(entry.operation),
    entry.migrationID,
    entry.migrationName
  );
}

export function formatMigration(migration: Migration) {
  return format('%s %s\n', migration.id, migration.name);
}

export function formatMigrationLong(migration: Migration) {
  let cwd = process.cwd();
  if (migration.split) {
    return format(
      '%s %s\n  %s\n  %s\n',
      migration.id, migration.name,
      path.relative(cwd, migration.upPath),
      path.relative(cwd, migration.downPath)
    );
  } else {
    return format(
      '%s %s\n  %s\n',
      migration.id, migration.name,
      path.relative(cwd, migration.path)
    );
  }
}

export function formatState(state: State) {
  switch (state) {
    case State.pending: return colors.pending('pending ');
    case State.applied: return colors.apply('applied ');
    case State.reverted: return colors.revert('reverted');
    case State.missing: return colors.missing('missing ');
  }
}

export function formatMigrationState(migrationState: MigrationState) {
  return format(
    '%s %s %s\n',
    formatState(migrationState.state),
    migrationState.migrationID,
    migrationState.migrationName
  );
}
