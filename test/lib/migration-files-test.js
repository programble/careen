'use strict';

var R = require('ramda');
var Promise = require('bluebird');

var assert = require('assert');
var path = require('path');

var migrationFiles = require('../../lib/migration-files');

var FIXTURES_PATH = path.join(__dirname, '..', 'fixtures', 'migration-files');

function callList(fixturePath) {
  return function() {
    return this.names = migrationFiles.list(
      path.join(FIXTURES_PATH, 'list-names', fixturePath)
    );
  };
}

describe('Migration files', function() {
  describe('list', function() {
    describe('with missing directory', function() {
      it('fails', function() {
        var migrationsPath = path.join(FIXTURES_PATH, 'list-names', 'noent');
        return migrationFiles.list(migrationsPath)
          .then(function() {
            assert(false);
          }, function(err) {
            assert(err instanceof Promise.OperationalError);
          });
      });
    });

    describe('with empty directory', function() {
      before(callList('empty'));

      it('returns array', function() {
        return this.names.tap(function(names) {
          assert(names instanceof Array);
        });
      });

      it('returns no names', function() {
        return this.names.tap(function(names) {
          assert.equal(names.length, 0);
        });
      });
    });

    describe('with migration files', function() {
      before(callList('migrations'));

      it('returns array', function() {
        return this.names.tap(function(names) {
          assert(names instanceof Array);
        });
      });

      it('returns 4 names', function() {
        return this.names.tap(function(names) {
          assert.equal(names.length, 4);
        });
      });

      it('parses first file name', function() {
        return this.names.tap(function(names) {
          assert.deepEqual(names[0], {
            fileName: '1418530498150.create-users-table.sql',
            timestamp: 1418530498150,
            name: 'create-users-table',
            direction: null
          });
        });
      });

      it('parses second file name', function() {
        return this.names.tap(function(names) {
          assert.deepEqual(names[1], {
            fileName: '1418530540663.add-users-created-at.up.sql',
            timestamp: 1418530540663,
            name: 'add-users-created-at',
            direction: 'up'
          });
        });
      });

      it('parses third file name', function() {
        return this.names.tap(function(names) {
          assert.deepEqual(names[2], {
            fileName: '1418530540663.add-users-created-at.down.sql',
            timestamp: 1418530540663,
            name: 'add-users-created-at',
            direction: 'down'
          });
        });
      });

      it('parses fourth file name', function() {
        return this.names.tap(function(names) {
          assert.deepEqual(names[3], {
            fileName: '1418530576433.create-posts-table.sql',
            timestamp: 1418530576433,
            name: 'create-posts-table',
            direction: null
          });
        });
      });
    });

    describe('with non-migration files', function() {
      before(callList('mixed'));

      it('returns only migration files', function() {
        return this.names.tap(function(names) {
          assert.deepEqual(R.map(R.prop('name'), names), [
            'create-users-table',
            'add-users-created-at',
            'add-users-created-at',
            'create-posts-table'
          ]);
        });
      });
    });
  });
});
