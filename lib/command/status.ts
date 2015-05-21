'use strict';

import * as R from 'ramda';
import * as Promise from 'bluebird';

import { Config } from '../config/index';
import { listMigrations } from '../files';
import { readJournal } from '../runner';
import { getMigrationStates } from '../status';
import { formatMigrationState } from '../format';

export default function status(config: Config) {
  let client = config.client;
  let command = config.commands.status;

  let list = listMigrations(config.files.directory);
  let read = readJournal(client.name, client.config, client.journalTable);

  return Promise.join(list, read, getMigrationStates)
    .then(states =>
      command.id
      ? R.filter(s => s.migrationID === command.id, states)
      : states
    )
    .map(formatMigrationState)
    .then(R.join(''));
}
