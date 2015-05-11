'use strict';

import fs = require('fs');
import path = require('path');
import assert = require('assert');

import R = require('ramda');
import Promise = require('bluebird');
Promise.promisifyAll(fs);
import mockFS = require('mock-fs');

import files = require('../lib/files');

describe('Files', function() {
  describe('ensureDirectory', function() {
    describe('with missing directory', function() {
      before(() => mockFS({}));

      it('succeeds', () => files.ensureDirectory('migrations'));

      it('creates directory', () =>
        fs.statAsync('migrations')
          .tap(stats => assert(stats.isDirectory()))
      );

      after(mockFS.restore);
    });

    describe('with existing directory', function() {
      before(() => mockFS({migrations: {}}));

      it('succeeds', () => files.ensureDirectory('migrations'));

      after(mockFS.restore);
    });
  });

  describe('create', function() {
    before(() => mockFS({migrations: {}}));

    let migration: files.Migration;

    it('succeeds', () =>
      files.create('---\n', 'migrations', '1', 'test').tap(m => migration = m)
    );

    it('returns migration', function() {
      assert.equal(migration.id, '1');
      assert.equal(migration.name, 'test');
      assert.equal(migration.split, false);
      assert(migration.path);
    });

    it('creates file', () =>
      fs.statAsync(migration.path).tap(stats => assert(stats.isFile()))
    );

    it('writes template to file', () =>
      fs.readFileAsync(migration.path, {encoding: 'utf8'})
        .tap(data => assert.equal(data, '---\n'))
    );

    after(mockFS.restore);
  });

  describe('createSplit', function() {
    before(() => mockFS({migrations: {}}));

    let migration: files.Migration;

    it('succeeds', () =>
      files.createSplit('-- up\n', '-- down\n', 'migrations', '1', 'test')
        .tap(m => migration = m)
    );

    it('returns migration', function() {
      assert.equal(migration.id, '1');
      assert.equal(migration.name, 'test');
      assert.equal(migration.split, true);
      assert(migration.upPath);
      assert(migration.downPath);
    });

    it('creates up file', () =>
      fs.statAsync(migration.upPath)
        .tap(stats => assert(stats.isFile()))
    );

    it('creates down file', () =>
      fs.statAsync(migration.downPath)
        .tap(stats => assert(stats.isFile()))
    );

    it('writes up template to file', () =>
      fs.readFileAsync(migration.upPath, {encoding: 'utf8'})
        .tap(sql => assert.equal(sql, '-- up\n'))
    );

    it('writes down template to file', () =>
      fs.readFileAsync(migration.downPath, {encoding: 'utf8'})
        .tap(sql => assert.equal(sql, '-- down\n'))
    );

    after(mockFS.restore);
  });

  describe('listMigrations', function() {
    describe('with empty directory', function() {
      before(() => mockFS({migrations: {}}));

      let migrations: files.Migration[];

      it('succeeds', () =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('returns empty array', () => assert.equal(migrations.length, 0));

      after(mockFS.restore);
    });

    describe('with migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.first.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
          '2.second.sql': 'CREATE TABLE b (b INTEGER);\n---\nDROP TABLE b;\n'
        }
      }));

      let migrations: files.Migration[];

      it('succeeds', () =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('returns array of migrations sorted by ID', function() {
        assert.equal(migrations.length, 2);
        assert(migrations[0].id < migrations[1].id);
      });

      it('returns migration IDs', function() {
        assert.equal(migrations[0].id, '1');
        assert.equal(migrations[1].id, '2');
      });

      it('returns migration names', function() {
        assert.equal(migrations[0].name, 'first');
        assert.equal(migrations[1].name, 'second');
      });

      it('returns migration split false', function() {
        assert.equal(migrations[0].split, false);
        assert.equal(migrations[1].split, false);
      });

      it('returns migration paths', function() {
        assert.equal(migrations[0].path, path.join('migrations', '1.first.sql'));
        assert.equal(migrations[1].path, path.join('migrations', '2.second.sql'));
      });

      after(mockFS.restore);
    });

    describe('with non-migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.left.sql': 'invalid name',
          '1.sql': 'missing name',
          'test.sql': 'missing id',
          '1.test.txt': 'not sql',
          '1.test.sql~': 'suffix'
        }
      }));

      let migrations: files.Migration[];

      it('succeeds', () =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('does not return non-migrations', () =>
        assert.equal(migrations.length, 1)
      );

      after(mockFS.restore);
    });

    describe('with split migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.first.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.first.down.sql': 'DROP TABLE a;\n',
          '2.second.up.sql': 'CREATE TABLE b (b INTEGER);\n',
          '2.second.down.sql': 'DROP TABLE b;\n'
        }
      }));

      let migrations: files.Migration[];

      it('succeeds', () =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('returns array of migrations sorted by ID', function() {
        assert.equal(migrations.length, 2);
        assert(migrations[0].id < migrations[1].id);
      });

      it('returns migration IDs', function() {
        assert.equal(migrations[0].id, '1');
        assert.equal(migrations[1].id, '2');
      });

      it('returns migration names', function() {
        assert.equal(migrations[0].name, 'first');
        assert.equal(migrations[1].name, 'second');
      });

      it('returns migration split true', function() {
        assert.equal(migrations[0].split, true);
        assert.equal(migrations[1].split, true);
      });

      it('returns up migration paths', function() {
        assert.equal(migrations[0].upPath, path.join('migrations', '1.first.up.sql'));
        assert.equal(migrations[1].upPath, path.join('migrations', '2.second.up.sql'));
      });

      it('returns down migration paths', function() {
        assert.equal(migrations[0].downPath, path.join('migrations', '1.first.down.sql'));
        assert.equal(migrations[1].downPath, path.join('migrations', '2.second.down.sql'));
      });

      after(mockFS.restore);
    });

    describe('with missing split migration file', function() {
      before(() => mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n'
        }
      }));

      it('throws SplitFileMissingError', () =>
        files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileMissingError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });

    describe('with two split migration files of same type', function() {
      before(() => mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.what.up.sql': 'CREATE TABLE a (b INTEGER);\n'
        }
      }));

      it('throws SplitFileMissingError', () =>
        files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileMissingError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });

    describe('with conflicting migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.down.sql': 'DROP TABLE a;\n'
        }
      }));

      it('throws SplitFileConflictError', () =>
        files.listMigrations('migrations')
          .then(R.F)
          .catch(files.SplitFileConflictError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });
  });

  describe('readUpSQL', function() {
    describe('with split migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.down.sql': 'DROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];
      let upSQL: string;

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('succeeds', () =>
        files.readUpSQL(migrations[0]).tap(s => upSQL = s)
      );

      it('reads up SQL', () =>
        assert.equal(upSQL, 'CREATE TABLE a (a INTEGER);')
      );

      after(mockFS.restore);
    });

    describe('with non-split migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];
      let upSQL: string;

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('succeeds', () =>
        files.readUpSQL(migrations[0]).tap(s => upSQL = s)
      );

      it('reads up SQL', () =>
        assert.equal(upSQL, 'CREATE TABLE a (a INTEGER);')
      );

      after(mockFS.restore);
    });

    describe('with missing SQL section', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n'
        }
      }));

      let migrations: files.Migration[];

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('throws SQLMissingError', () =>
        files.readUpSQL(migrations[0])
          .then(R.F)
          .catch(files.SQLMissingError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });

    describe('with conflicting SQL sections', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\n---\nDROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('throws SQLConflictError', () =>
        files.readUpSQL(migrations[0])
          .then(R.F)
          .catch(files.SQLConflictError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });
  });

  describe('readDownSQL', function() {
    describe('with split migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.up.sql': 'CREATE TABLE a (a INTEGER);\n',
          '1.test.down.sql': 'DROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];
      let downSQL: string;

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('succeeds', () =>
        files.readDownSQL(migrations[0]).tap(s => downSQL = s)
      );

      it('reads down SQL', () =>
        assert.equal(downSQL, 'DROP TABLE a;')
      );

      after(mockFS.restore);
    });

    describe('with non-split migration files', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];
      let downSQL: string;

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('succeeds', () =>
        files.readDownSQL(migrations[0]).tap(s => downSQL = s)
      );

      it('reads down SQL', () =>
        assert.equal(downSQL, 'DROP TABLE a;')
      );

      after(mockFS.restore);
    });

    describe('with missing SQL section', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n'
        }
      }));

      let migrations: files.Migration[];

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('throws SQLMissingError', () =>
        files.readDownSQL(migrations[0])
          .then(R.F)
          .catch(files.SQLMissingError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });

    describe('with conflicting SQL sections', function() {
      before(() => mockFS({
        migrations: {
          '1.test.sql': 'CREATE TABLE a (a INTEGER);\n---\n---\nDROP TABLE a;\n'
        }
      }));

      let migrations: files.Migration[];

      before(() =>
        files.listMigrations('migrations').tap(ms => migrations = ms)
      );

      it('throws SQLConflictError', () =>
        files.readDownSQL(migrations[0])
          .then(R.F)
          .catch(files.SQLConflictError, R.T)
          .then(assert)
      );

      after(mockFS.restore);
    });
  });
});
