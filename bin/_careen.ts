'use strict';

import * as fs from 'fs';

import { DEFAULTS, loadFile, loadArgs } from '../lib/config/index';
import { run } from '../lib/command/index';

export default function main(argv: string[]) {
  let fileConfig = DEFAULTS;

  if (fs.existsSync('careen.js')) {
    fileConfig = loadFile('careen.js');
  } else if (fs.existsSync('careen.json')) {
    fileConfig = loadFile('careen.json');
  }

  let argsConfig = loadArgs(argv.slice(2), fileConfig);

  run(argsConfig);
}
