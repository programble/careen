'use strict';

var FS = require('fs');
var Path = require('path');
var assert = require('assert');

var R = require('ramda');
var Promise = require('bluebird');
Promise.promisifyAll(FS);
var mockFS = require('mock-fs');

var Files = require('../lib/files');

var assertFalse = R.partial(assert, false);
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

  describe('listMigrations', function() {
    describe('with empty directory', function() {
      before(hooks.mockFS({migrations: {}}));

      it('succeeds', function() {
        return this.migrations = Files.listMigrations('migrations');
      });
      it('returns empty array', function() {
        return this.migrations.tap(function(migrations) {
          assert(Array.isArray(migrations));
          assert.equal(migrations.length, 0);
        });
      });

      after(hooks.restoreFS);
    });

    describe('with migration files', function() {
      before(hooks.mockFS({
        migrations: {
          '1.first.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
          '2.second.sql': 'CREATE TABLE b (b INTEGER);\n---\nDROP TABLE b;\n'
        }
      }));

      it('succeeds', function() {
        return this.migrations = Files.listMigrations('migrations');
      });
      it('returns array of migrations sorted by ID', function() {
        return this.migrations.tap(function(migrations) {
          assert(Array.isArray(migrations));
          assert.equal(migrations.length, 2);
          assert(migrations[0].id < migrations[1].id);
        });
      });
      it('returns migration IDs', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].id, '1');
          assert.equal(migrations[1].id, '2');
        });
      });
      it('returns migration names', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].name, 'first');
          assert.equal(migrations[1].name, 'second');
        });
      });
      it('returns migration split false', function() {
        return this.migrations.each(function(migration) {
          assert.equal(migration.split, false);
        });
      });
      it('returns migration paths', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].path, Path.join('migrations', '1.first.sql'));
          assert.equal(migrations[1].path, Path.join('migrations', '2.second.sql'));
        });
      });

      after(hooks.restoreFS);
    });

    describe('with non-migration files', function() {
      before(hooks.mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.left.sql': 'invalid name',
          '1.sql': 'missing name',
          'test.sql': 'missing id',
          '1.test.txt': 'not sql'
        }
      }));

      it('succeeds', function() {
        return this.migrations = Files.listMigrations('migrations');
      });
      it('does not return non-migrations', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations.length, 1);
        });
      });

      after(hooks.restoreFS);
    });

    describe('with split migration files', function() {
      before(hooks.mockFS({
        migrations: {
          '1.first.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.first.down.sql': 'DROP TABLE a;\n',
          '2.second.up.sql': 'CREATE TABLE b (b INTEGER);\n',
          '2.second.down.sql': 'DROP TABLE b;\n'
        }
      }));

      it('succeeds', function() {
        return this.migrations = Files.listMigrations('migrations');
      });
      it('returns array of migrations sorted by ID', function() {
        return this.migrations.tap(function(migrations) {
          assert(Array.isArray(migrations));
          assert.equal(migrations.length, 2);
          assert(migrations[0].id < migrations[1].id);
        });
      });
      it('returns migration IDs', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].id, '1');
          assert.equal(migrations[1].id, '2');
        });
      });
      it('returns migration names', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].name, 'first');
          assert.equal(migrations[1].name, 'second');
        });
      });
      it('returns migration split true', function() {
        return this.migrations.each(function(migration) {
          assert.equal(migration.split, true);
        });
      });
      it('returns migration up paths', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].upPath, Path.join('migrations', '1.first.up.sql'));
          assert.equal(migrations[1].upPath, Path.join('migrations', '2.second.up.sql'));
        });
      });
      it('returns migration down paths', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].downPath, Path.join('migrations', '1.first.down.sql'));
          assert.equal(migrations[1].downPath, Path.join('migrations', '2.second.down.sql'));
        });
      });

      after(hooks.restoreFS);
    });

    describe('with missing split migration file', function() {
      before(hooks.mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n'
        }
      }));

      it('throws SplitFileMissingError', function() {
        return Files.listMigrations('migrations')
          .then(assertFalse, function(error) {
            assert(error instanceof Files.SplitFileMissingError);
          });
      });

      after(hooks.restoreFS);
    });

    describe('with two split migration files of same type', function() {
      before(hooks.mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.what.up.sql': 'CREATE TABLE a (b INTEGER);\n'
        }
      }));

      it('throws SplitFileMissingError', function() {
        return Files.listMigrations('migrations')
          .then(assertFalse, function(error) {
            assert(error instanceof Files.SplitFileMissingError);
          });
      });

      after(hooks.restoreFS);
    });

    describe('with conflicting migration files', function() {
      before(hooks.mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.down.sql': 'DROP TABLE a;\n'
        }
      }));

      it('throws SplitFileConflictError', function() {
        return Files.listMigrations('migrations')
          .then(assertFalse, function(error) {
            assert(error instanceof Files.SplitFileConflictError);
          });
      });

      after(hooks.restoreFS);
    });
  });
});
