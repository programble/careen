'use strict';

module.exports = function(t) {
  var hooks = {
    createDatabase: function() {
      return this.configuration = t.createDatabase();
    },
    connect: function() {
      return this.db = this.configuration.then(t.Implementation.connect);
    },
    ensureMigrationsTable: function() {
      return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
    },
    beginTransaction: function() {
      return this.db.then(t.Implementation.beginTransaction);
    },
    disconnect: function() {
      return this.db.then(t.Implementation.disconnect);
    },
    dropDatabase: function() {
      return this.configuration.then(t.dropDatabase);
    }
  };

  (t.skip ? describe.skip : describe)(t.prettyName, function() {
    describe('connect', function() {
      before(hooks.createDatabase);
      it('succeeds', function() {
        return this.db = this.configuration.then(t.Implementation.connect);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('disconnect', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      it('succeeds', function() {
        return this.db.then(t.Implementation.disconnect);
      });
      after(hooks.dropDatabase);
    });

    describe('ensureMigrationsTable', function() {
      describe('without existing table', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        it('succeeds', function() {
          return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
        });
        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });

      describe('with existing table', function() {
        before(hooks.createDatabase);
        before(hooks.connect);
        before(hooks.ensureMigrationsTable);
        it('succeeds', function() {
          return this.db.then(t.Implementation.ensureMigrationsTable('migrations'));
        });
        after(hooks.disconnect);
        after(hooks.dropDatabase);
      });
    });

    describe('beginTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      it('succeeds', function() {
        return this.db.then(t.Implementation.beginTransaction);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('commitTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);
      it('succeeds', function() {
        return this.db.then(t.Implementation.commitTransaction);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });

    describe('rollbackTransaction', function() {
      before(hooks.createDatabase);
      before(hooks.connect);
      before(hooks.beginTransaction);
      it('succeeds', function() {
        return this.db.then(t.Implementation.rollbackTransaction);
      });
      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });
  });
};
