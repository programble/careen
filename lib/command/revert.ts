'use strict';

import * as R from 'ramda';
import * as Promise from 'bluebird';

import { Config, Method } from '../config/index';
import { listMigrations } from '../files';
import { readJournal, revertEach, revertAll, revertDry } from '../runner';
import { getMigrationStates, isRevertable } from '../status';
import { formatJournalEntry } from '../format';

function revertFunction(method: Method) {
  switch (method) {
    case Method.each: return revertEach;
    case Method.all: return revertAll;
    case Method.dry: return revertDry;
  }
}

export default function revert(config: Config) {
  let client = config.client;
  let command = config.commands.revert;

  let migrations = listMigrations(config.files.directory);
  let journal = readJournal(client.name, client.config, client.journalTable);
  let states = Promise.join(migrations, journal, getMigrationStates);

  let revertableIDs = states
    .then(R.filter(isRevertable))
    .then(ss => R.map(s => s.migrationID, ss));
  let toRevertIDs: Promise<string[]>;

  if (command.id) {
    toRevertIDs = revertableIDs.then(R.filter(id => id === command.id));
  } else if (command.to) {
    toRevertIDs = revertableIDs.then(R.filter(id => id > command.to));
  } else if (command.number) {
    toRevertIDs = revertableIDs.then(R.reverse).then(R.take(command.number));
  } else {
    toRevertIDs = Promise.resolve([]);
  }

  let toRevert = Promise.join(migrations, toRevertIDs, (ms, ids) =>
    R.filter(m => R.contains(m.id, ids), R.reverse(ms))
  );

  let revert = toRevert.then(ms =>
    revertFunction(command.method)(
      client.name, client.config, client.journalTable, ms
    )
  );

  let previousEntry = journal.then(es => R.last(es));
  let newEntries = Promise.join(previousEntry, revert, (prev, es) =>
    R.filter(e => e.timestamp > prev.timestamp, es)
  );

  return newEntries
    .then(R.map(formatJournalEntry))
    .then(R.join(''));
}
