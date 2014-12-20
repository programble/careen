'use strict';

var R = require('ramda');
var Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));
var writeFile = R.curry(R.bind(fs.writeFileAsync, fs));

// Regular expression to match file names of migration files.
var FILE_NAME_REGEXP = /^(\d+)\.([^.]+)\.(up|down)?\.?sql$/i;

// Create a migration file name object from a regular expression match.
function nameObjectFromMatch(match) {
  return {
    fileName: match[0],
    timestamp: parseInt(match[1]),
    name: match[2],
    direction: match[3] || null
  };
}

// Return a sort key for migration file name objects that sorts by timestamp
// with up migrations appearing before down migrations.
function nameObjectSortKey(name) {
  // FIXME: Is there a better way to do this?
  return name.timestamp + (name.direction === 'down' ? 0.5 : 0);
}

// Returns a Promise of a sorted array of migration file name objects located
// in migrationsPath.
function list(migrationsPath) {
  return fs.readdirAsync(migrationsPath)
    .then(R.map(R.match(FILE_NAME_REGEXP)))
    .then(R.filter(R.identity))
    .then(R.map(nameObjectFromMatch))
    .then(R.sortBy(nameObjectSortKey));
}
exports.list = list;
