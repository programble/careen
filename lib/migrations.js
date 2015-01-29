'use strict';

var R = require('ramda');
var Promise = require('bluebird');

var path = require('path');
var fs = Promise.promisifyAll(require('fs'));

var FILENAME_REGEXP = /^(\d+)\.([^.]+)\.(up|down)?\.?sql$/i;
var SQL_SPLIT_REGEXP = /^-{3,}\s*$/m;

function matchToObject(match) {
  return {
    filename: match[0],
    timestamp: parseInt(match[1]),
    name: match[2],
    direction: match[3] || 'both'
  };
}

function loadDirectory(directory) {
  var resolved = path.resolve(directory);

  return fs.readdirAsync(resolved)
    .then(R.map(R.match(FILENAME_REGEXP)))
    .then(R.filter(R.identity))
    .then(R.map(
      R.pipe(matchToObject, R.assoc('directory', resolved))
    ))
    .then(R.sortBy(R.prop('timestamp')));
}

function findFile(direction, timestamp, files) {
  return R.find(function(file) {
    if (file.timestamp !== timestamp) return false;
    if (file.direction === direction || file.direction === 'both') return true;
  }, files);
}

function loadSQL(direction, file) {
  return Promise.resolve(file)
    .then(function(file) {
      return fs.readFileAsync(
        path.join(file.directory, file.filename),
        { encoding: 'utf8' }
      );
    })
    .then(R.split(SQL_SPLIT_REGEXP))
    .then(function(parts) {
      if (parts.length === 1) return parts[0];
      if (direction === 'up') return parts[0];
      if (direction === 'down') return parts[1];
    })
    .then(R.trim);
}

function generateFilename(direction, name) {
  var timestamp = +new Date();
  if (direction === 'both') {
    return [ timestamp, name, 'sql' ].join('.');
  } else {
    return [ timestamp, name, direction, 'sql' ].join('.');
  }
}

module.exports = {
  loadDirectory: loadDirectory,
  findFile: R.curry(findFile),
  loadSQL: R.curry(loadSQL)
};
