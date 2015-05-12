'use strict';

import client = require('../client/index');

export enum Method { each, all, dry };

export interface RunnerConfig {
  method: Method;
  id?: string;
  to?: string;
  number?: number;
  all?: boolean;
}

export enum Command {
  apply, revert, journal, status, migrations, create, version, help
}

export interface Config {
  client: {
    name: string;
    config: client.Config;
    journalTable: string;
  };

  files: {
    directory: string;
  };

  command: Command;

  commands: {
    migrations: {
      long: boolean;
      id?: string;
    };

    status: {
      id?: string;
    };

    journal: {
      id?: string;
    };

    create: {
      idGenerator: () => string;
      split: boolean;
      name: string;
      templatePaths: {
        combined: string;
        up: string;
        down: string;
      };
    };

    apply: RunnerConfig;

    revert: RunnerConfig;
  };
}
