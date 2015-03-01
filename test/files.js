'use strict';

var FS = require('fs');
var assert = require('assert');

var Promise = require('bluebird');
Promise.promisifyAll(FS);
var mockFS = require('mock-fs');

var Files = require('../lib/files');

var hooks = {
  mockFS: function(config) {
    return function() {
      mockFS(config);
    };
  },
  restoreFS: function() {
    mockFS.restore();
  }
};

describe('Files', function() {
  describe('ensureDirectory', function() {
    describe('with missing directory', function() {
      before(hooks.mockFS({}));

      it('succeeds', function() {
        return Files.ensureDirectory('migrations');
      });
      it('creates directory', function() {
        return FS.statAsync('migrations').tap(function(stats) {
          assert(stats.isDirectory());
        });
      });

      after(hooks.restoreFS);
    });

    describe('with existing directory', function() {
      before(hooks.mockFS({migrations: {}}));

      it('succeeds', function() {
        return Files.ensureDirectory('migrations');
      });

      after(hooks.restoreFS);
    });
  });

  describe('create', function() {
    before(hooks.mockFS({migrations: {}}));

    it('succeeds', function() {
      return this.path = Files.create('---\n', 'migrations', '1', 'test');
    });
    it('returns path', function() {
      return this.path.tap(function(path) {
        assert(typeof path, 'string');
      });
    });
    it('creates file', function() {
      return this.path
        .then(FS.statAsync.bind(FS))
        .tap(function(stats) {
          assert(stats.isFile());
        });
    });
    it('writes template to file', function() {
      return this.path
        .then(function(path) {
          return FS.readFileAsync(path, {encoding: 'utf8'});
        })
        .tap(function(data) {
          assert.equal(data, '---\n');
        });
    });

    after(hooks.restoreFS);
  });

  describe('createSplit', function() {
    before(hooks.mockFS({migrations: {}}));

    it('succeeds', function() {
      return this.paths = Files.createSplit(
        '-- up\n', '-- down\n', 'migrations', '1', 'test'
      );
    });
    it('returns paths', function() {
      return this.paths.tap(function(paths) {
        assert.equal(paths.length, 2);
        assert.equal(typeof paths[0], 'string');
        assert.equal(typeof paths[1], 'string');
      });
    });
    it('creates files', function() {
      return this.paths
        .map(function(path) {
          return FS.statAsync(path);
        })
        .each(function(stats) {
          assert(stats.isFile());
        });
    });
    it('writes up template to file', function() {
      return this.paths
        .get(0)
        .then(function(path) {
          return FS.readFileAsync(path, {encoding: 'utf8'});
        })
        .tap(function(data) {
          assert.equal(data, '-- up\n');
        });
    });
    it('writes down template to file', function() {
      return this.paths
        .get(1)
        .then(function(path) {
          return FS.readFileAsync(path, {encoding: 'utf8'});
        })
        .tap(function(data) {
          assert.equal(data, '-- down\n');
        });
    });

    after(hooks.restoreFS);
  });
});
