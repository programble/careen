'use strict';

import { Config, Command } from '../config/index';

import create from './create';
import help from './help';
import version from './version';

export { create, help, version };

function commandFunction(config: Config): (config: Config) => void {
  switch (config.command) {
    case Command.create: return create;
    case Command.help: return help;
    case Command.version: return version;
  }
}

export function run(config: Config): void {
  commandFunction(config)(config);
}
