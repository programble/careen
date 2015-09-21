'use strict';

import * as R from 'ramda';
import * as Promise from 'bluebird';

import { Config, Method } from '../config/index';
import { listMigrations } from '../files';
import { readJournal, applyEach, applyAll, applyDry } from '../runner';
import { getMigrationStates, isApplicable } from '../status';
import { formatJournalEntry } from '../format';

function applyFunction(method: Method) {
  switch (method) {
    case Method.each: return applyEach;
    case Method.all: return applyAll;
    case Method.dry: return applyDry;
  }
}

export default function apply(config: Config) {
  let client = config.client;
  let command = config.commands.apply;

  let migrations = listMigrations(config.files.directory);
  let journal = readJournal(client.name, client.config, client.journalTable);
  let states = Promise.join(migrations, journal, getMigrationStates)

  let applicableIDs = states
    .then(R.filter(isApplicable))
    .then(ss => R.map(s => s.migrationID, ss));
  let toApplyIDs: Promise<string[]>;

  if (command.pending) {
    toApplyIDs = applicableIDs;
  } else if (command.id) {
    toApplyIDs = applicableIDs.then(R.filter(id => id === command.id));
  } else if (command.to) {
    toApplyIDs = applicableIDs.then(R.filter(id => id <= command.to));
  } else if (command.number) {
    toApplyIDs = applicableIDs.then(R.take(command.number));
  } else {
    toApplyIDs = Promise.resolve([]);
  }

  let toApply = Promise.join(migrations, toApplyIDs, (ms, ids) =>
    R.filter(m => R.contains(m.id, ids), ms)
  );

  let apply = toApply.then(ms =>
    applyFunction(command.method)(
      client.name, client.config, client.journalTable, ms
    )
  );

  let previousEntry = journal.then(es => R.last(es));
  let newEntries = Promise.join(previousEntry, apply, (prev, es) =>
    prev ? R.filter(e => e.timestamp > prev.timestamp, es) : apply
  );

  return newEntries
    .then(R.map(formatJournalEntry))
    .then(R.join(''));
}
