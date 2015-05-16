'use strict';

import * as path from 'path';

import { Config, Command, Method } from './structure';

const TEMPLATE_PATH = path.join(__dirname, '..', '..', 'template');

const DEFAULTS: Config = {
  client: {
    name: 'dummy',
    config: {},
    journalTable: 'schema_journal'
  },

  files: {
    directory: 'migrations'
  },

  command: Command.status,

  commands: {
    migrations: {
      long: false
    },

    status: {},

    journal: {},

    create: {
      idGenerator: () => new Date().valueOf().toString(36),
      split: false,
      name: 'migration',
      templatePaths: {
        combined: path.join(TEMPLATE_PATH, 'combined.sql'),
        up: path.join(TEMPLATE_PATH, 'up.sql'),
        down: path.join(TEMPLATE_PATH, 'down.sql')
      }
    },

    apply: {
      method: Method.all,
      pending: true
    },

    revert: {
      method: Method.all,
      number: 1
    }
  }
};

export default DEFAULTS;
