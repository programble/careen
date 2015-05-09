'use strict';

import assert = require('assert');

import R = require('ramda');
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
  var config: U;
  var db: client.Connection;

  var hooks = {
    createDatabase: function() {
      this.timeout(5000);
      return t.createDatabase().tap(c => config = c);
    },
    dropDatabase: function() {
      this.timeout(5000);
      return t.dropDatabase(config);
    },
    connect:          () => t.client.connect(config).tap(c => db = c),
    beginTransaction: () => t.client.beginTransaction(db),
    ensureJournal:    () => t.client.ensureJournal(db, 'journal'),
    disconnect:       () => t.client.disconnect(db),
  };

  (t.skip ? describe.skip : describe)(t.prettyName + ' client', function() {
    describe('connect', function() {
      before(hooks.createDatabase);

      it('succeeds', () =>
        t.client.connect(config).tap(c => db = c)
      );

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('disconnect', function() {
      before(hooks.createDatabase);
      before(hooks.connect);

      it('succeeds', () => t.client.disconnect(db));

      after(hooks.dropDatabase);
    });

    describe('beginTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);

      it('succeeds', () => t.client.beginTransaction(db));

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('commitTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);

      it('succeeds', () => t.client.commitTransaction(db));

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('rollbackTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);

      it('succeeds', () => t.client.rollbackTransaction(db));

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('ensureJournal', function() {
      describe('without journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', () => t.client.ensureJournal(db, 'journal'));

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        it('succeeds', () => t.client.ensureJournal(db, 'journal'));

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('appendJournal', function() {
      describe('with empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        it('succeeds', () =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          })
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with non-empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(() =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          })
        );

        it('succeeds', () =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.revert,
            migrationID: '1',
            migrationName: 'test'
          })
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('readJournal', function() {
      describe('with empty journal', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        var entries: client.JournalEntry[];

        it('succeeds', () =>
          t.client.readJournal(db, 'journal').tap(es => entries = es)
        );

        it('returns empty array', () => assert.equal(entries.length, 0));

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with a single entry', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(() =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'test'
          })
        );

        var entries: client.JournalEntry[];

        it('succeeds', () =>
          t.client.readJournal(db, 'journal').tap(es => entries = es)
        );

        it('returns array of one object', function() {
          assert(Array.isArray(entries));
          assert.equal(entries.length, 1);
          assert.equal(typeof entries[0], 'object');
        });

        it('returns Date timestamp', () =>
          assert(entries[0].timestamp instanceof Date)
        );

        it('returns operation', () =>
          assert.equal(entries[0].operation, client.Operation.apply)
        );

        it('returns migrationID', () =>
          assert.equal(entries[0].migrationID, '1')
        );

        it('returns migrationName', () =>
          assert.equal(entries[0].migrationName, 'test')
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with multiple entries', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureJournal);

        before(() =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '1',
            migrationName: 'first'
          })
        );
        before(() =>
          t.client.appendJournal(db, 'journal', {
            operation: client.Operation.apply,
            migrationID: '2',
            migrationName: 'second'
          })
        );

        var entries: client.JournalEntry[];

        it('succeeds', () =>
          t.client.readJournal(db, 'journal').tap(es => entries = es)
        );

        it('returns ordered entries', function() {
          assert.equal(entries[0].migrationID, '1');
          assert.equal(entries[1].migrationID, '2');
        });

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('runMigrationSQL', function() {
      describe('with a single statement', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', () =>
          t.client.runMigrationSQL(db, 'CREATE TABLE a (a INTEGER);')
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with multiple statements', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', () =>
          t.client.runMigrationSQL(
            db,
            'CREATE TABLE a (a INTEGER); CREATE TABLE b (b INTEGER);'
          )
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with newlines', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', () =>
          t.client.runMigrationSQL(db, 'CREATE TABLE a\n(a INTEGER);')
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with comments', function() {
        before(hooks.createDatabase);
        before(hooks.connect);

        it('succeeds', () =>
          t.client.runMigrationSQL(
            db,
            'CREATE TABLE a (a INTEGER);\n-- comment\nCREATE TABLE b (b INTEGER);'
          )
        );

        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });
  });
}

export = suite;
