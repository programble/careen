'use strict';

import fs = require('fs');
import path = require('path');

import R = require('ramda');
import Promise = require('bluebird');
Promise.promisifyAll(fs);
import SuperError = require('super-error');

export function ensureDirectory(directory: string) {
  return fs.mkdirAsync(directory).catch(R.propEq('code', 'EEXIST'));
}

export function create(template: string, directory: string, id: string, name: string) {
  var fileName = id + '.' + name + '.sql';
  var filePath = path.join(directory, fileName);
  return fs.writeFileAsync(filePath, template, {flag: 'wx'}).return(filePath);
}

export function createSplit(
  upTemplate: string, downTemplate: string, directory: string, id: string, name: string
) {
  var upName = id + '.' + name + '.up.sql';
  var upPath = path.join(directory, upName);
  var downName = id + '.' + name + '.down.sql';
  var downPath = path.join(directory, downName);
  return Promise.join(
    fs.writeFileAsync(upPath, upTemplate, {flag: 'wx'}),
    fs.writeFileAsync(downPath, downTemplate, {flag: 'wx'})
  ).return([upPath, downPath]);
}

export interface Migration {
  id: string;
  name: string;
  split: boolean;
  path?: string;
  upPath?: string;
  downPath?: string;
}

var MIGRATION_FILE_REGEXP = /^([^.]+)\.([^.]+)\.(up|down)?\.?sql$/;

export var SplitFileMissingError = SuperError.subclass(
  'SplitFileMissingError', function(path: string) {
    this.message = 'Missing corresponding migration file for: ' + path;
  }
);

export var SplitFileConflictError = SuperError.subclass(
  'SplitFileConflictError', function(paths: string[]) {
    this.message = 'Conflicting migration files: ' + paths.join(', ');
  }
);

function matchesToMigration(directory: string, matches: RegExpMatchArray[]): Migration {
  if (matches.length === 1) {
    var match = matches[0];

    // Single match is a split migration file.
    if (match[3]) throw new SplitFileMissingError(match[0]);

    return {
      id: match[1],
      name: match[2],
      split: false,
      path: path.join(directory, match[0])
    };
  } else if (matches.length === 2) {
    var upMatch = R.find(R.propEq(3, 'up'), matches);
    var downMatch = R.find(R.propEq(3, 'down'), matches);

    if (!upMatch) throw new SplitFileMissingError(downMatch[0]);
    if (!downMatch) throw new SplitFileMissingError(upMatch[0]);

    return {
      id: upMatch[1],
      name: upMatch[2],
      split: true,
      upPath: path.join(directory, upMatch[0]),
      downPath: path.join(directory, downMatch[0])
    };
  } else {
    // Too many matches.
    throw new SplitFileConflictError(R.map(R.nth(0), matches));
  }
}

export function listMigrations(directory: string): Promise<Migration[]> {
  return fs.readdirAsync(directory)
    .map(R.match(MIGRATION_FILE_REGEXP))
    .filter(R.identity)
    .then(R.groupBy(R.nth<string>(1)))
    .then(R.mapObj(R.partial(matchesToMigration, directory)))
    .then(R.values)
    .then(R.sortBy((migration: Migration) => migration.id));
}

var MIGRATION_SQL_SPLIT_REGEXP = /^-{3,}$/m;

export var SQLMissingError = SuperError.subclass(
  'SQLMissingError', function(path: string) {
    this.message = 'SQL section missing in migration file: ' + path;
  }
);

export var SQLConflictError = SuperError.subclass(
  'SQLConflictError', function(path: string) {
    this.message = 'Too many SQL sections in migration file: ' + path;
  }
);

function assertSQLSections(migration: Migration, sections: string[]): void {
  if (sections.length < 2) {
    throw new SQLMissingError(migration.path);
  } else if (sections.length > 2) {
    throw new SQLConflictError(migration.path);
  }
}

export function readUpSQL(migration: Migration): Promise<string> {
  if (migration.split) {
    return fs.readFileAsync(migration.upPath, {encoding: 'utf8'})
      .then(R.trim);
  }
  return fs.readFileAsync(migration.path, {encoding: 'utf8'})
    .then(R.split(MIGRATION_SQL_SPLIT_REGEXP))
    .tap(R.partial(assertSQLSections, migration))
    .then(R.nth(0))
    .then(R.trim);
}

export function readDownSQL(migration: Migration): Promise<string> {
  if (migration.split) {
    return fs.readFileAsync(migration.downPath, {encoding: 'utf8'})
      .then(R.trim);
  }
  return fs.readFileAsync(migration.path, {encoding: 'utf8'})
    .then(R.split(MIGRATION_SQL_SPLIT_REGEXP))
    .tap(R.partial(assertSQLSections, migration))
    .then(R.nth(1))
    .then(R.trim);
}
