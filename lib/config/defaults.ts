'use strict';

import path = require('path');

import structure = require('./structure');

const TEMPLATE_PATH = path.join(__dirname, '..', '..', 'template');

const DEFAULTS: structure.Config = {
  client: {
    name: 'dummy',
    config: {},
    journalTable: 'schema_journal'
  },

  files: {
    directory: 'migrations'
  },

  command: structure.Command.status,

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
      method: structure.Method.all,
      pending: true
    },

    revert: {
      method: structure.Method.all,
      number: 1
    }
  }
};

export = DEFAULTS;
