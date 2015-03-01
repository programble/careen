'use strict';

/**
 * Migration file management.
 * @module Files
 */

var FS = require('fs');
var Path = require('path');

var R = require('ramda');
var Promise = require('bluebird');
Promise.promisifyAll(FS);

/**
 * Ensure the migrations directory exists.
 * @alias module:Files.ensureDirectory
 * @param {string} directory - Path to migrations directory
 * @returns {Promise.<*>}
 * @todo Handle missing parent directories.
 */
function ensureDirectory(directory) {
  return FS.mkdirAsync(directory).catch(R.propEq('code', 'EEXIST'));
}

/**
 * Create a migration file. Curried.
 * @alias module:Files.create
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
 * @alias module:Files.createSplit
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

module.exports = {
  ensureDirectory: ensureDirectory,
  create: R.curry(create),
  createSplit: R.curry(createSplit)
};
