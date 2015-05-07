'use strict';

import fs = require('fs');
import path = require('path');
import assert = require('assert');

import R = require('ramda');
import Promise = require('bluebird');
Promise.promisifyAll(fs);
import mockFS = require('mock-fs');

import files = require('../lib/files');

var hooks = {
  mockFS: function(config: mockFS.Config) {
    return function() {
      mockFS(config);
    };
  },
  restoreFS: function() {
    mockFS.restore();
  },
  listMigrations: function() {
    return this.migrations = files.listMigrations('migrations');
  }
};

describe('Files', function() {
  describe('ensureDirectory', function() {
    describe('with missing directory', function() {
      before(hooks.mockFS({}));

      it('succeeds', function() {
        return files.ensureDirectory('migrations');
      });
      it('creates directory', function() {
        return fs.statAsync('migrations').tap(function(stats) {
          assert(stats.isDirectory());
        });
      });

      after(hooks.restoreFS);
    });

    describe('with existing directory', function() {
      before(hooks.mockFS({migrations: {}}));

      it('succeeds', function() {
        return files.ensureDirectory('migrations');
      });

      after(hooks.restoreFS);
    });
  });

  describe('create', function() {
    before(hooks.mockFS({migrations: {}}));

    it('succeeds', function() {
      return this.path = files.create('---\n', 'migrations', '1', 'test');
    });
    it('creates file', function() {
      return this.path
        .then(fs.statAsync.bind(fs))
        .tap(function(stats) {
          assert(stats.isFile());
        });
    });
    it('writes template to file', function() {
      return this.path
        .then(function(path) {
          return fs.readFileAsync(path, {encoding: 'utf8'});
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
      return this.paths = files.createSplit(
        '-- up\n', '-- down\n', 'migrations', '1', 'test'
      );
    });
    it('returns paths', function() {
      return this.paths.tap(function(paths) {
        assert.equal(paths.length, 2);
      });
    });
    it('creates files', function() {
      return this.paths
        .map(function(path) {
          return fs.statAsync(path);
        })
        .each(function(stats) {
          assert(stats.isFile());
        });
    });
    it('writes up template to file', function() {
      return this.paths
        .get(0)
        .then(function(path) {
          return fs.readFileAsync(path, {encoding: 'utf8'});
        })
        .tap(function(data) {
          assert.equal(data, '-- up\n');
        });
    });
    it('writes down template to file', function() {
      return this.paths
        .get(1)
        .then(function(path) {
          return fs.readFileAsync(path, {encoding: 'utf8'});
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
        return this.migrations = files.listMigrations('migrations');
      });
      it('returns empty array', function() {
        return this.migrations.tap(function(migrations) {
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
        return this.migrations = files.listMigrations('migrations');
      });
      it('returns array of migrations sorted by ID', function() {
        return this.migrations.tap(function(migrations) {
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
          assert.equal(migrations[0].path, path.join('migrations', '1.first.sql'));
          assert.equal(migrations[1].path, path.join('migrations', '2.second.sql'));
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
          '1.test.txt': 'not sql',
          '1.test.sql~': 'suffix'
        }
      }));

      it('succeeds', function() {
        return this.migrations = files.listMigrations('migrations');
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
        return this.migrations = files.listMigrations('migrations');
      });
      it('returns array of migrations sorted by ID', function() {
        return this.migrations.tap(function(migrations) {
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
      it('returns up migration paths', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].upPath, path.join('migrations', '1.first.up.sql'));
          assert.equal(migrations[1].upPath, path.join('migrations', '2.second.up.sql'));
        });
      });
      it('returns down migration paths', function() {
        return this.migrations.tap(function(migrations) {
          assert.equal(migrations[0].downPath, path.join('migrations', '1.first.down.sql'));
          assert.equal(migrations[1].downPath, path.join('migrations', '2.second.down.sql'));
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
        return files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileMissingError, R.T)
          .then(assert);
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
        return files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileMissingError, R.T)
          .then(assert);
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
        return files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileConflictError, R.T)
          .then(assert);
      });

      after(hooks.restoreFS);
    });
  });
});
