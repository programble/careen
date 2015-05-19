'use strict';

import * as R from 'ramda';

import { Config } from '../config/index';
import { listMigrations } from '../files';
import { formatMigration, formatMigrationLong } from '../format';

export default function migrations(config: Config) {
  let command = config.commands.migrations;

  return listMigrations(config.files.directory)
    .then(migrations =>
      command.id
      ? R.filter(m => m.id === command.id, migrations)
      : migrations
    )
    .map(command.long ? formatMigrationLong : formatMigration)
    .then(R.join(''));
}
