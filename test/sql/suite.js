'use strict';

module.exports = function(t) {
  var flagDescribe = t.skip ? describe.skip : describe;

  flagDescribe(t.prettyName, function() {
    describe('connect', function() {
      before(function createDatabase() {
        return this.configuration = t.createDatabase();
      });

      it('succeeds', function() {
        return this.db = this.configuration.then(t.Implementation.connect);
      });

      after(function disconnect() {
        return this.db.then(t.Implementation.disconnect)
      });
      after(function dropDatabase() {
        return this.configuration.then(t.dropDatabase);
      });
    });

    describe('disconnect', function() {
      before(function createDatabase() {
        return this.configuration = t.createDatabase();
      });
      before(function connect() {
        return this.db = this.configuration.then(t.Implementation.connect);
      });

      it('succeeds', function() {
        return this.db.then(t.Implementation.disconnect);
      });

      after(function dropDatabase() {
        return this.configuration.then(t.dropDatabase);
      });
    });

    describe('ensureMigrationsTable', function() {
      describe('without existing table', function() {
        before(function createDatabase() {
          return this.configuration = t.createDatabase();
        });
        before(function connect() {
          return this.db = this.configuration.then(t.Implementation.connect);
        });

        it('succeeds', function() {
          return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
        });

        after(function disconnect() {
          return this.db.then(t.Implementation.disconnect);
        });
        after(function dropDatabase() {
          return this.configuration.then(t.dropDatabase);
        });
      });

      describe('with existing table', function() {
        before(function createDatabase() {
          return this.configuration = t.createDatabase();
        });
        before(function connect() {
          return this.db = this.configuration.then(t.Implementation.connect);
        });
        before(function ensureMigrationsTable() {
          return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
        });

        it('succeeds', function() {
          return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
        });

        after(function disconnect() {
          return this.db.then(t.Implementation.disconnect);
        });
        after(function dropDatabase() {
          return this.configuration.then(t.dropDatabase);
        });
      });
    });
  });
};
