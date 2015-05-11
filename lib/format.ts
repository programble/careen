'use strict';

import util = require('util');
import path = require('path');

import chalk = require('chalk');

import client = require('./client/index');
import files = require('./files');
import status = require('./status');

const colors = {
  apply: chalk.green,
  revert: chalk.magenta,
  pending: chalk.blue,
  missing: chalk.yellow
};

export function formatOperation(op: client.Operation) {
  return (op === client.Operation.apply)
    ? colors.apply('apply ')
    : colors.revert('revert');
}

export function formatJournalEntry(entry: client.JournalEntry) {
  return util.format(
    '%s %s %s %s\n',
    entry.timestamp.toISOString(),
    formatOperation(entry.operation),
    entry.migrationID,
    entry.migrationName
  );
}

export function formatMigration(migration: files.Migration) {
  return util.format('%s %s\n', migration.id, migration.name);
}

export function formatMigrationLong(migration: files.Migration) {
  let cwd = process.cwd();
  if (migration.split) {
    return util.format(
      '%s %s\n  %s\n  %s\n',
      migration.id, migration.name,
      path.relative(cwd, migration.upPath),
      path.relative(cwd, migration.downPath)
    );
  } else {
    return util.format(
      '%s %s\n  %s\n',
      migration.id, migration.name,
      path.relative(cwd, migration.path)
    );
  }
}

export function formatState(state: status.State) {
  switch (state) {
    case status.State.pending: return colors.pending('pending ');
    case status.State.applied: return colors.apply('applied ');
    case status.State.reverted: return colors.apply('reverted');
    case status.State.missing: return colors.missing('missing ');
  }
}

export function formatMigrationState(migrationState: status.MigrationState) {
  return util.format(
    '%s %s %s\n',
    formatState(migrationState.state),
    migrationState.migrationID,
    migrationState.migrationName
  );
}
