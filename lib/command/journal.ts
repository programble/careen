'use strict';

import * as R from 'ramda';

import { Config } from '../config/index';
import { readJournal } from '../runner';
import { formatJournalEntry } from '../format';

export default function journal(config: Config) {
  let client = config.client;
  let command = config.commands.journal;

  return readJournal(client.name, client.config, client.journalTable)
    .then(entries =>
      command.id
      ? R.filter(e => e.migrationID === command.id, entries)
      : entries
    )
    .map(formatJournalEntry)
    .then(R.join(''));
}
