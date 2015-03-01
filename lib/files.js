'use strict';

/**
 * Migration file management.
 * @module Files
 */

var fs = require('fs');
var path = require('path');

var R = require('ramda');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

/**
 * Ensure the migrations directory exists.
 * @alias module:Files.ensureDirectory
 * @param {string} directory - Path to migrations directory
 * @returns {Promise.<*>}
 * @todo Handle missing parent directories.
 */
function ensureDirectory(directory) {
  return fs.mkdirAsync(directory).catch(R.propEq('code', 'EEXIST'));
}

/**
 * Create a migration file. Curried.
 * @alias module:Files.create
 * @param {string} template - Default migration file contents
 * @param {string} directory - Path to migrations directory
 * @param {string} id - Migration ID
 * @param {string} name - Migration name
 * @returns {Promise.<*>}
 */
function create(template, directory, id, name) {
  var fileName = id + '.' + name + '.sql';
  var filePath = path.join(directory, fileName);
  return fs.writeFileAsync(filePath, template, {flag: 'wx'});
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
 * @returns {Promise.<Array.<*>>}
 */
function createSplit(upTemplate, downTemplate, directory, id, name) {
  var upName = id + '.' + name + '.up.sql';
  var upPath = path.join(directory, upName);
  var downName = id + '.' + name + '.down.sql';
  var downPath = path.join(directory, downName);
  return Promise.join(
    fs.writeFileAsync(upPath, upTemplate, {flag: 'wx'}),
    fs.writeFileAsync(downPath, downTemplate, {flag: 'wx'})
  );
}

module.exports = {
  ensureDirectory: ensureDirectory,
  create: R.curry(create),
  createSplit: R.curry(createSplit)
};
