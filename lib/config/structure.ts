'use strict';

import * as client from '../client/index';

export enum Method { each, all, dry };

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

    apply: {
      method: Method;
      pending: boolean;
      id?: string;
      to?: string;
      number?: number;
    };

    revert: {
      method: Method;
      number: number;
      id?: string;
      to?: string;
    };
  };
}
