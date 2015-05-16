'use strict';

import * as fs from 'fs';

import * as Promise from 'bluebird';
Promise.promisifyAll(fs);

import { Config } from '../config/index';
import * as files from '../files';
import { formatMigrationLong } from '../format';

export default function create(config: Config) {
  let directory = config.files.directory;
  let command = config.commands.create;

  let id = command.generateID();

  let ensureDirectory = files.ensureDirectory(directory);
  let createMigration: Promise<files.Migration>;

  if (command.split) {
    let readUpTemplate = fs.readFileAsync(
      command.templatePaths.up,
      {encoding: 'utf8'}
    );
    let readDownTemplate = fs.readFileAsync(
      command.templatePaths.down,
      {encoding: 'utf8'}
    );

    createMigration = Promise.join(
      readUpTemplate,
      readDownTemplate,
      ensureDirectory,
      (up, down) => files.createSplit(up, down, directory, id, command.name)
    );
  } else {
    let readTemplate = fs.readFileAsync(
      command.templatePaths.combined,
      {encoding: 'utf8'}
    );
    createMigration = Promise.join(
      readTemplate,
      ensureDirectory,
      template => files.create(template, directory, id, command.name)
    );
  }

  return createMigration.then(formatMigrationLong);
}
