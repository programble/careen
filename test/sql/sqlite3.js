'use strict';

var path = require('path');

var SQLite3 = require('../../lib/sql/sqlite3');

var FIXTURE_PATH = path.join(__dirname, '..', 'fixture', 'sql', 'sqlite3');

var flagDescribe = process.env.TEST_SKIP_SQL_SQLITE3 ? describe.skip : describe;

flagDescribe('SQLite3', function() {
  describe('connect', function() {
    describe('to :memory:', function() {
      it('succeeds', function() {
        return this.db = SQLite3.connect({filename: ':memory:'});
      });

      after(function() {
        return this.db.then(SQLite3.disconnect);
      });
    });

    describe('to file', function() {
      it('succeeds', function() {
        return this.db = SQLite3.connect({
          filename: path.join(FIXTURE_PATH, 'empty.sqlite')
        });
      });

      after(function() {
        return this.db.then(SQLite3.disconnect);
      });
    });
  });

  describe('disconnect', function() {
    describe('from :memory', function() {
      before(function() {
        return this.db = SQLite3.connect({filename: ':memory:'});
      });

      it('succeeds', function() {
        return this.db.then(SQLite3.disconnect);
      });
    });

    describe('from file', function() {
      before(function() {
        return this.db = SQLite3.connect({
          filename: path.join(FIXTURE_PATH, 'empty.sqlite')
        });
      });

      it('succeeds', function() {
        return this.db.then(SQLite3.disconnect);
      });
    });
  });

  describe('ensureMigrationsTable', function() {
    describe('with empty database', function() {
      before(function() {
        return this.db = SQLite3.connect({filename: ':memory:'});
      });

      it('succeeds', function() {
        return this.db.then(SQLite3.ensureMigrationsTable('migrations'));
      });

      after(function() {
        return this.db.then(SQLite3.disconnect);
      });
    });

    describe('with existing table', function() {
      before(function() {
        this.db = SQLite3.connect({filename: ':memory:'});
        return this.db.then(SQLite3.ensureMigrationsTable('migrations'));
      });

      it('succeeds', function() {
        return this.db.then(SQLite3.ensureMigrationsTable('migrations'));
      });

      after(function() {
        return this.db.then(SQLite3.disconnect);
      });
    });
  });
});
