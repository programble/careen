'use strict';

/**
 * Migration file management.
 * @module files
 */

var FS = require('fs');
var Path = require('path');

var R = require('ramda');
var Promise = require('bluebird');
Promise.promisifyAll(FS);
var SuperError = require('super-error');

/**
 * Ensure the migrations directory exists.
 * @alias module:files.ensureDirectory
 * @param {string} directory - Path to migrations directory
 * @returns {Promise.<*>}
 * @todo Handle missing parent directories.
 */
function ensureDirectory(directory) {
  return FS.mkdirAsync(directory).catch(R.propEq('code', 'EEXIST'));
}

/**
 * Create a migration file. Curried.
 * @alias module:files.create
 * @param {string} template - Default migration file contents
 * @param {string} directory - Path to migrations directory
 * @param {string} id - Migration ID
 * @param {string} name - Migration name
 * @returns {Promise.<string>} Path of created file
 */
function create(template, directory, id, name) {
  var fileName = id + '.' + name + '.sql';
  var filePath = Path.join(directory, fileName);
  return FS.writeFileAsync(filePath, template, {flag: 'wx'}).return(filePath);
}

/**
 * Create split migration files, one for the up migration and one for the down
 * migration. Curried.
 *
 * @alias module:files.createSplit
 * @param {string} upTemplate - Default up migration file contents
 * @param {string} downTemplate - Default down migration file contents
 * @param {string} directory - Path to migrations directory
 * @param {string} id - Migration ID
 * @param {string} name - Migration name
 * @returns {Promise.<string[]>} Paths of created up and down files
 */
function createSplit(upTemplate, downTemplate, directory, id, name) {
  var upName = id + '.' + name + '.up.sql';
  var upPath = Path.join(directory, upName);
  var downName = id + '.' + name + '.down.sql';
  var downPath = Path.join(directory, downName);
  return Promise.join(
    FS.writeFileAsync(upPath, upTemplate, {flag: 'wx'}),
    FS.writeFileAsync(downPath, downTemplate, {flag: 'wx'})
  ).return([upPath, downPath]);
}

/**
 * Migration.
 * @typedef {Object} module:files.Migration
 * @property {string} id - Migration ID
 * @property {string} name - Migration name
 * @property {boolean} split - Whether migration is in split files
 * @property {?string} path - Migration file path, if not split
 * @property {?string} upPath - Up migration file path, if split
 * @property {?string} downPath - Down migration file path, if split
 */

/**
 * Regular expression matching valid migration file names.
 * @type {RegExp}
 * @constant
 */
var MIGRATION_FILE_REGEXP = /^([^.]+)\.([^.]+)\.(up|down)?\.?sql$/;

/**
 * Split migration file missing error.
 * @alias module:files.SplitFileMissingError
 * @class
 * @param {string} path - Corresponding migration file path
 */
var SplitFileMissingError = SuperError.subclass('SplitFileMissingError', function(path) {
  this.message = 'Missing corresponding migration file for: ' + path;
});

/**
 * Split migration file conflict error.
 * @alias module:files.SplitFileConflictError
 * @class
 * @param {string[]} paths - Conflicting migration file paths
 */
var SplitFileConflictError = SuperError.subclass('SplitFileConflictError', function(paths) {
  this.message = 'Conflicting migration files: ' + paths.join(', ');
});

/**
 * Transform migration file name regular expression matches with the same ID to
 * migration objects. Curried.
 *
 * @param {string} directory - Path to migrations directory
 * @param {Array.<string[]>} matches - Regular expression matches
 * @returns {module:files.Migration}
 * @throws {module:files.SplitFileMissingError}
 * @throws {module:files.SplitFileConflictError}
 */
function matchesToMigration(directory, matches) {
  if (matches.length === 1) {
    var match = matches[0];

    // Single match is a split migration file.
    if (match[3]) throw new SplitFileMissingError(match[0]);

    return {
      id: match[1],
      name: match[2],
      split: false,
      path: Path.join(directory, match[0])
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
      upPath: Path.join(directory, upMatch[0]),
      downPath: Path.join(directory, downMatch[0])
    };
  } else {
    // Too many matches.
    throw new SplitFileConflictError(R.map(R.nth(0), matches));
  }
}
matchesToMigration = R.curry(matchesToMigration);

/**
 * List migrations in migrations directory.
 * @alias module:files.listMigrations
 * @param {string} directory - Path to migrations directory
 * @returns {Promise.<module:files.Migration[]>} Migrations, sorted by ID
 * @throws {module:files.SplitFileMissingError}
 * @throws {module:files.SplitFileConflictError}
 */
function listMigrations(directory) {
  return FS.readdirAsync(directory)
    .map(R.match(MIGRATION_FILE_REGEXP))
    .filter(R.identity)
    .then(R.groupBy(R.nth(1)))
    .then(R.mapObj(matchesToMigration(directory)))
    .then(R.values)
    .then(R.sortBy(R.prop('id')));
}

/**
 * Regular expression matching SQL up/down split indicator.
 * @type {RegExp}
 * @constant
 */
var MIGRATION_SQL_SPLIT_REGEXP = /^-{3,}$/m;

/**
 * SQL section missing error, caused by missing "down" section in non-split
 * migration files.
 *
 * @alias module:files.SQLMissingError
 * @class
 * @param {string} path - Migration file path
 */
var SQLMissingError = SuperError.subclass('SQLMissingError', function(path) {
  this.message = 'SQL section missing in migration file: ' + path;
});

/**
 * SQL section conflict error, caused by too many sections in non-split
 * migration files.
 *
 * @alias module:files.SQLConflictError
 * @class
 * @param {string} path - Migration file path
 */
var SQLConflictError = SuperError.subclass('SQLConflictError', function(path) {
  this.message = 'Too many SQL sections in migration file: ' + path;
});

/**
 * Assert that a migration contains the correct number of SQL sections.
 * Curried.
 *
 * @param {module:files.Migration} migration
 * @param {string[]} sections - SQL sections
 * @throws {module:files.SQLMissingError}
 * @throws {module:files.SQLConflictError}
 */
function assertSQLSections(migration, sections) {
  if (sections.length < 2) {
    throw new SQLMissingError(migration.path);
  } else if (sections.length > 2) {
    throw new SQLConflictError(migration.path);
  }
}
assertSQLSections = R.curry(assertSQLSections);

/**
 * Read up migration SQL, trimming whitespace.
 * @alias module:files.readUpSQL
 * @param {module:files.Migration} migration
 * @returns {Promise.<string>}
 * @throws {module:files.SQLMissingError}
 * @throws {module:files.SQLConflictError}
 */
function readUpSQL(migration) {
  if (migration.split) {
    return FS.readFileAsync(migration.upPath, {encoding: 'utf8'})
      .call('trim');
  }
  return FS.readFileAsync(migration.path, {encoding: 'utf8'})
    .then(R.split(MIGRATION_SQL_SPLIT_REGEXP))
    .tap(assertSQLSections(migration))
    .get(0)
    .call('trim');
}

/**
 * Read down migration SQL, trimming whitespace.
 * @alias module:files.readDownSQL
 * @param {module:files.Migration} migration
 * @returns {Promise.<string>}
 * @throws {module:files.SQLMissingError}
 * @throws {module:files.SQLConflictError}
 */
function readDownSQL(migration) {
  if (migration.split) {
    return FS.readFileAsync(migration.downPath, {encoding: 'utf8'})
      .call('trim');
  }
  return FS.readFileAsync(migration.path, {encoding: 'utf8'})
    .then(R.split(MIGRATION_SQL_SPLIT_REGEXP))
    .tap(assertSQLSections(migration))
    .get(1)
    .call('trim');
}

module.exports = {
  SplitFileMissingError: SplitFileMissingError,
  SplitFileConflictError: SplitFileConflictError,
  SQLMissingError: SQLMissingError,
  SQLConflictError: SQLConflictError,
  ensureDirectory: ensureDirectory,
  create: R.curry(create),
  createSplit: R.curry(createSplit),
  listMigrations: listMigrations,
  readUpSQL: readUpSQL,
  readDownSQL: readDownSQL
};
