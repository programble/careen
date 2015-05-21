'use strict';

import { Config, Command } from '../config/index';

import status from './status';
import migrations from './migrations';
import create from './create';
import help from './help';
import version from './version';

export { create, help, version };

function commandFunction(config: Config): (config: Config) => Promise<string> {
  switch (config.command) {
    case Command.apply: return help;
    case Command.revert: return help;
    case Command.journal: return help;
    case Command.status: return status;
    case Command.migrations: return migrations;
    case Command.create: return create;
    case Command.help: return help;
    case Command.version: return version;
  }
}

export function run(config: Config) {
  return commandFunction(config)(config);
}
