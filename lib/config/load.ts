'use strict';

import * as path from 'path';

import * as R from 'ramda';

import { ConfigTypeError, ConfigEnumError } from './errors';
import DEFAULTS from './defaults';
import { Config, Command, Method } from './structure';

function setKey(to: any, keyPath: string[], type: string, from: any): void {
  let key = R.last(keyPath);
  if (!from.hasOwnProperty(key)) return;

  let value = from[key];
  ConfigTypeError.assert(keyPath.join('.'), type, value);

  to[key] = value;
}

function setEnumKey(to: any, keyPath: string[], enumObject: any, from: any): void {
  let key = R.last(keyPath);
  if (!from.hasOwnProperty(key)) return;

  ConfigTypeError.assert(keyPath.join('.'), 'string', from[key]);

  let value = enumObject[from[key]];
  if (typeof value === 'undefined') {
    throw new ConfigEnumError(keyPath.join('.'), enumObject, from[key]);
  }

  to[key] = value;
}

export function loadObject(object: any, defaults = DEFAULTS): Config {
  let config = R.clone(defaults);

  if (object.hasOwnProperty('client')) {
    let client = object.client;
    ConfigTypeError.assert('client', 'object', client);

    setKey(config.client, ['client', 'name'], 'string', client);
    setKey(config.client, ['client', 'config'], 'object', client);
    setKey(config.client, ['client', 'journalTable'], 'string', client);
  }

  if (object.hasOwnProperty('files')) {
    ConfigTypeError.assert('files', 'object', object.files);

    setKey(config.files, ['files', 'directory'], 'string', object.files);
  }

  setEnumKey(config, ['command'], Command, object);

  if (object.hasOwnProperty('commands')) {
    let commands = object.commands;
    ConfigTypeError.assert('commands', 'object', commands);

    if (commands.hasOwnProperty('migrations')) {
      let migrations = commands.migrations;
      ConfigTypeError.assert('commands.migrations', 'object', migrations);

      setKey(
        config.commands.migrations,
        ['commands', 'migrations', 'long'],
        'boolean',
        migrations
      );
      setKey(
        config.commands.migrations,
        ['commands', 'migrations', 'id'],
        'string',
        migrations
      );
    }

    if (commands.hasOwnProperty('status')) {
      let status = commands.status;
      ConfigTypeError.assert('commands.status', 'object', status);

      setKey(
        config.commands.status,
        ['commands', 'status', 'id'],
        'string',
        status
      );
    }

    if (commands.hasOwnProperty('journal')) {
      let journal = commands.journal;
      ConfigTypeError.assert('commands.journal', 'object', journal);

      setKey(
        config.commands.journal,
        ['commands', 'journal', 'id'],
        'string',
        journal
      );
    }

    if (commands.hasOwnProperty('create')) {
      let create = commands.create;
      ConfigTypeError.assert('commands.create', 'object', create);

      setKey(
        config.commands.create,
        ['commands', 'create', 'idGenerator'],
        'function',
        create
      );
      setKey(
        config.commands.create,
        ['commands', 'create', 'split'],
        'boolean',
        create
      );
      setKey(
        config.commands.create,
        ['commands', 'create', 'name'],
        'string',
        create
      );

      if (create.hasOwnProperty('templatePaths')) {
        let templatePaths = create.templatePaths;
        ConfigTypeError.assert('commands.create.templatePaths', 'object', templatePaths);

        setKey(
          config.commands.create.templatePaths,
          ['commands', 'create', 'templatePaths', 'combined'],
          'string',
          templatePaths
        );
        setKey(
          config.commands.create.templatePaths,
          ['commands', 'create', 'templatePaths', 'up'],
          'string',
          templatePaths
        );
        setKey(
          config.commands.create.templatePaths,
          ['commands', 'create', 'templatePaths', 'down'],
          'string',
          templatePaths
        );
      }
    }

    if (commands.hasOwnProperty('apply')) {
      let apply = commands.apply;
      ConfigTypeError.assert('commands.apply', 'object', apply);

      setEnumKey(
        config.commands.apply,
        ['commands', 'apply', 'method'],
        Method,
        apply
      );
      setKey(
        config.commands.apply,
        ['commands', 'apply', 'pending'],
        'boolean',
        apply
      );
      setKey(
        config.commands.apply,
        ['commands', 'apply', 'id'],
        'string',
        apply
      );
      setKey(
        config.commands.apply,
        ['commands', 'apply', 'to'],
        'string',
        apply
      );
      setKey(
        config.commands.apply,
        ['commands', 'apply', 'number'],
        'number',
        apply
      );

      let notPending = [
        apply['id'],
        apply['to'],
        apply['number']
      ];
      if (R.any(R.identity, notPending)) config.commands.apply.pending = false;
    }

    if (commands.hasOwnProperty('revert')) {
      let revert = commands.revert;
      ConfigTypeError.assert('commands.revert', 'object', revert);

      setEnumKey(
        config.commands.revert,
        ['commands', 'revert', 'method'],
        Method,
        revert
      );
      setKey(
        config.commands.revert,
        ['commands', 'revert', 'id'],
        'string',
        revert
      );
      setKey(
        config.commands.revert,
        ['commands', 'revert', 'to'],
        'string',
        revert
      );
      setKey(
        config.commands.revert,
        ['commands', 'revert', 'number'],
        'number',
        revert
      );
    }
  }

  return config;
}

export function loadFile(filePath: string, defaults = DEFAULTS): Config {
  // Always require an absolute path to bypass require search
  return loadObject(require(path.resolve(filePath)), defaults);
}
