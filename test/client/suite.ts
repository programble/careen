'use strict';

import assert = require('assert');

import Promise = require('bluebird');

import client = require('../../lib/client/index');

interface Suite<T extends client.Client, U extends client.Config> {
  prettyName: string;
  skip: boolean;
  client: T;
  createDatabase: () => Promise<U>;
  dropDatabase: (config: U) => Promise<any>;
}

function suite<T extends client.Client, U extends client.Config>(t: Suite<T, U>) {
  var hooks = {
    createDatabase: function() {
      return this.config = t.createDatabase();
    },
    connect: function() {
      return this.db = this.config.then(t.client.connect);
    },
    beginTransaction: function() {
      return this.db.then(t.client.beginTransaction);
    },
    ensureJournal: function() {
      return Promise.join(this.db, 'journal')
        .spread(t.client.ensureJournal);
    },
    disconnect: function() {
      return this.db.then(t.client.disconnect);
    },
    dropDatabase: function() {
      return this.config.then(t.dropDatabase);
    }
  };

  (t.skip ? describe.skip : describe)(t.prettyName + ' client', function() {
    describe('connect', function() {
      before(hooks.createDatabase);

      it('succeeds', function() {
        return this.db = this.config.then(t.client.connect);
      });

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('disconnect', function() {
      before(hooks.createDatabase);
      before(hooks.connect);

      it('succeeds', function() {
        return this.db.then(t.client.disconnect);
      });

      after(hooks.dropDatabase);
    });

    describe('beginTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);

      it('succeeds', function() {
        return this.db.then(t.client.beginTransaction);
      });

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('commitTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);

      it('succeeds', function() {
        return this.db.then(t.client.commitTransaction);
      });

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('rollbackTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);

      it('succeeds', function() {
        return this.db.then(t.client.rollbackTransaction);
      });

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('ensureJournal', function() {
      describe('without journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(this.db, 'journal')
            .spread(t.client.ensureJournal);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        it('succeeds', function() {
          return Promise.join(this.db, 'journal')
            .spread(t.client.ensureJournal);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('appendJournal', function() {
      describe('with empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        it('succeeds', function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          }).spread(t.client.appendJournal);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with non-empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          }).spread(t.client.appendJournal);
        });

        it('succeeds', function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.revert,
            migrationID: '1',
            migrationName: 'test'
          }).spread(t.client.appendJournal);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('readJournal', function() {
      describe('with empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        it('succeeds', function() {
          return this.entries = Promise.join(this.db, 'journal')
            .spread(t.client.readJournal);
        });

        it('returns empty array', function() {
          return this.entries.tap(function(entries) {
            assert.deepEqual(entries, []);
          });
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with a single entry', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          }).spread(t.client.appendJournal);
        });

        it('succeeds', function() {
          return this.entries = Promise.join(this.db, 'journal')
            .spread(t.client.readJournal);
        });

        it('returns array of objects', function() {
          return this.entries
            .tap(function(entries) {
              assert(Array.isArray(entries));
            })
            .each(function(entry) {
              assert.equal(typeof entry, 'object');
            });
        });

        it('returns Date timestamp', function() {
          return this.entries.get(0).tap(function(entry) {
            assert(entry.timestamp instanceof Date);
          });
        });

        it('returns operation', function() {
          return this.entries.get(0).tap(function(entry) {
            assert.equal(entry.operation, client.Operation.apply);
          });
        });

        it('returns migrationID', function() {
          return this.entries.get(0).tap(function(entry) {
            assert.equal(entry.migrationID, '1');
          });
        });

        it('returns migrationName', function() {
          return this.entries.get(0).tap(function(entry) {
            assert.equal(entry.migrationName, 'test');
          });
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with multiple entries', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'first'
          }).spread(t.client.appendJournal);
        });
        before(function() {
          return Promise.join(this.db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '2',
            migrationName: 'second'
          }).spread(t.client.appendJournal);
        });

        it('succeeds', function() {
          return this.entries = Promise.join(this.db, 'journal')
            .spread(t.client.readJournal);
        });

        it('returns ordered entries', function() {
          return this.entries.tap(function(entries) {
            assert.equal(entries[0].migrationID, '1');
            assert.equal(entries[1].migrationID, '2');
          });
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('runMigrationSQL', function() {
      describe('with a single statement', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(this.db, 'CREATE TABLE a (a INTEGER);')
            .spread(t.client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with multiple statements', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(this.db, 'CREATE TABLE a (a INTEGER); CREATE TABLE b (b INTEGER);')
            .spread(t.client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with newlines', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(this.db, 'CREATE TABLE a\n(a INTEGER);')
            .spread(t.client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with comments', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(
            this.db,
            'CREATE TABLE a (a INTEGER);\n-- comment\nCREATE TABLE b (b INTEGER);'
          ).spread(t.client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });
  });
}

export = suite;
