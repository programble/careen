'use strict';

var assert = require('assert');

var Promise = require('bluebird');

module.exports = function(t) {
  var hooks = {
    createDatabase: function() {
      return this.configuration = t.createDatabase();
    },
    connect: function() {
      return this.db = this.configuration.then(t.Client.connect);
    },
    beginTransaction: function() {
      return this.db.then(t.Client.beginTransaction);
    },
    ensureJournal: function() {
      return Promise.join(this.db, 'journal')
        .spread(t.Client.ensureJournal);
    },
    disconnect: function() {
      return this.db.then(t.Client.disconnect);
    },
    dropDatabase: function() {
      return this.configuration.then(t.dropDatabase);
    }
  };

  var assertImplements = function(name, length) {
    return function() {
      assert.equal(typeof t.Client[name], 'function');
      assert.equal(t.Client[name].length, length);
    };
  };

  (t.skip ? describe.skip : describe)(t.prettyName + ' client', function() {
    it('implements connect', assertImplements('connect', 1));
    it('implements disconnect', assertImplements('disconnect', 1));
    it('implements beginTransaction', assertImplements('beginTransaction', 1));
    it('implements commitTransaction', assertImplements('commitTransaction', 1));
    it('implements rollbackTransaction', assertImplements('rollbackTransaction', 1));
    it('implements ensureJournal', assertImplements('ensureJournal', 2));
    it('implements appendJournal', assertImplements('appendJournal', 5));
    it('implements readJournal', assertImplements('readJournal', 2));
    it('implements runMigrationSQL', assertImplements('runMigrationSQL', 2));

    describe('connect', function() {
      before(hooks.createDatabase);
      it('succeeds', function() {
        return this.db = this.configuration.then(t.Client.connect);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('disconnect', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      it('succeeds', function() {
        return this.db.then(t.Client.disconnect);
      });
      after(hooks.dropDatabase);
    });

    describe('beginTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      it('succeeds', function() {
        return this.db.then(t.Client.beginTransaction);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('commitTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);
      it('succeeds', function() {
        return this.db.then(t.Client.commitTransaction);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('rollbackTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);
      it('succeeds', function() {
        return this.db.then(t.Client.rollbackTransaction);
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
            .spread(t.Client.ensureJournal);
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
            .spread(t.Client.ensureJournal);
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
          return Promise.join(this.db, 'journal', 'apply', '1', 'test')
            .spread(t.Client.appendJournal);
        });
        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with non-empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);
        before(function() {
          return Promise.join(this.db, 'journal', 'apply', '1', 'test')
            .spread(t.Client.appendJournal);
        });
        it('succeeds', function() {
          return Promise.join(this.db, 'journal', 'rollback', '1', 'test')
            .spread(t.Client.appendJournal);
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
            .spread(t.Client.readJournal);
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
          return Promise.join(this.db, 'journal', 'apply', '1', 'test')
            .spread(t.Client.appendJournal);
        });

        it('succeeds', function() {
          return this.entries = Promise.join(this.db, 'journal')
            .spread(t.Client.readJournal);
        });
        it('returns Array.<Object>', function() {
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
            assert.equal(entry.operation, 'apply');
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
          return Promise.join(this.db, 'journal', 'apply', '1', 'first')
            .spread(t.Client.appendJournal);
        });
        before(function() {
          return Promise.join(this.db, 'journal', 'apply', '2', 'second')
            .spread(t.Client.appendJournal);
        });

        it('succeeds', function() {
          return this.entries = Promise.join(this.db, 'journal')
            .spread(t.Client.readJournal);
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
            .spread(t.Client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with multiple statements', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(
            this.db,
            'CREATE TABLE a (a INTEGER); CREATE TABLE b (b INTEGER);'
          ).spread(t.Client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with newlines', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', function() {
          return Promise.join(this.db,'CREATE TABLE a\n(a INTEGER);')
            .spread(t.Client.runMigrationSQL);
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
          ).spread(t.Client.runMigrationSQL);
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });
  });
};
