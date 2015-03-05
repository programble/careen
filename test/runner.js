'use strict';

var assert = require('assert');

var R = require('ramda');
var Promise = require('bluebird');
var Sinon = require('sinon');
var mockFS = require('mock-fs');

var Files = require('../lib/files');
var Dummy = require('../lib/clients/dummy');
var Runner = require('../lib/runner');

var assertFalse = R.partial(assert, false);

var hooks = {
  spyDummy: function() {
    Sinon.spy(Dummy, 'connect');
    Sinon.spy(Dummy, 'ensureJournal');
    Sinon.spy(Dummy, 'readJournal');
    Sinon.spy(Dummy, 'beginTransaction');
    Sinon.spy(Dummy, 'runMigrationSQL');
    Sinon.spy(Dummy, 'appendJournal');
    Sinon.spy(Dummy, 'rollbackTransaction');
    Sinon.spy(Dummy, 'commitTransaction');
    Sinon.spy(Dummy, 'disconnect');
  },
  restoreDummy: function() {
    Dummy.connect.restore();
    Dummy.ensureJournal.restore();
    Dummy.readJournal.restore();
    Dummy.beginTransaction.restore();
    Dummy.runMigrationSQL.restore();
    Dummy.appendJournal.restore();
    Dummy.rollbackTransaction.restore();
    Dummy.commitTransaction.restore();
    Dummy.disconnect.restore();
  },
  spyFiles: function() {
    Sinon.spy(Files, 'readUpSQL');
    Sinon.spy(Files, 'readDownSQL');
  },
  restoreFiles: function() {
    Files.readUpSQL.restore();
    Files.readDownSQL.restore();
  },
  mockFS: function(config) {
    return function() {
      mockFS(config);
    };
  },
  restoreFS: function() {
    mockFS.restore();
  }
};

var migrations = {
  success3: {
    '1.first.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
    '2.second.sql': 'CREATE TABLE b (b INTEGER);\n---\nDROP TABLE b;\n',
    '3.third.sql': 'CREATE TABLE c (c INTEGER);\n---\nDROP TABLE c;\n'
  },
  fail2Up: {
    '1.first.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
    '2.second.sql': 'ERROR test;\n---\nDROP TABLE b;\n',
    '3.third.sql': 'CREATE TABLE c (c INTEGER);\n---\nDROP TABLE c;\n'
  },
  fail2Down: {
    '1.first.sql': 'CREATE TABLE a (a INTEGER);\n---\nDROP TABLE a;\n',
    '2.second.sql': 'CREATE TABLE b (b INTEGER);\n---\nERROR test;\n',
    '3.third.sql': 'CREATE TABLE c (c INTEGER);\n---\nDROP TABLE c;\n'
  }
};

describe('Runner', function() {
  describe('readJournal', function() {
    before(hooks.spyDummy);

    it('succeeds', function() {
      return this.journal = Runner.readJournal('dummy', {}, 'journal');
    });
    it('calls connect', function() {
      assert.equal(Dummy.connect.callCount, 1);
    });
    it('calls ensureJournal', function() {
      assert.equal(Dummy.ensureJournal.callCount, 1);
    });
    it('calls readJournal', function() {
      assert.equal(Dummy.readJournal.callCount, 1);
    });
    it('calls disconnect', function() {
      assert.equal(Dummy.disconnect.callCount, 1);
    });
    it('returns journal', function() {
      return Promise.join(
        this.journal,
        Dummy.readJournal.firstCall.returnValue,
        assert.equal
      );
    });

    after(hooks.restoreDummy);
  });

  describe('applyEach', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.applyEach('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction for each', function() {
        assert.equal(Dummy.beginTransaction.callCount, 3);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('calls commitTransaction for each', function() {
        assert.equal(Dummy.commitTransaction.callCount, 3);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Up}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.applyEach = Files.listMigrations('migrations')
          .then(Runner.applyEach('dummy', {}, 'journal'));
        return this.applyEach.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction for each', function() {
        assert.equal(Dummy.beginTransaction.callCount, 2);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('calls commitTransaction for each success', function() {
        assert.equal(Dummy.commitTransaction.callCount, 1);
      });
      it('calls rollbackTransaction for failure', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.applyEach.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });

  describe('applyAll', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.applyAll('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('calls commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 1);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Up}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.applyAll = Files.listMigrations('migrations')
          .then(Runner.applyAll('dummy', {}, 'journal'));
        return this.applyAll.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.applyAll.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });

  describe('applyDry', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.applyDry('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Up}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.applyAll = Files.listMigrations('migrations')
          .then(Runner.applyAll('dummy', {}, 'journal'));
        return this.applyAll.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readUpSQL for each', function() {
        assert.equal(Files.readUpSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.applyAll.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });

  describe('revertEach', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.revertEach('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction for each', function() {
        assert.equal(Dummy.beginTransaction.callCount, 3);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('calls commitTransaction for each', function() {
        assert.equal(Dummy.commitTransaction.callCount, 3);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Down}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.revertEach = Files.listMigrations('migrations')
          .then(Runner.revertEach('dummy', {}, 'journal'));
        return this.revertEach.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction for each', function() {
        assert.equal(Dummy.beginTransaction.callCount, 2);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('calls commitTransaction for each success', function() {
        assert.equal(Dummy.commitTransaction.callCount, 1);
      });
      it('calls rollbackTransaction for failure', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.revertEach.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });

  describe('revertAll', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.revertAll('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('calls commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 1);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Down}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.revertAll = Files.listMigrations('migrations')
          .then(Runner.revertAll('dummy', {}, 'journal'));
        return this.revertAll.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.revertAll.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });

  describe('revertDry', function() {
    describe('without error', function() {
      before(hooks.mockFS({migrations: migrations.success3}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('succeeds', function() {
        return Files.listMigrations('migrations')
          .then(Runner.revertDry('dummy', {}, 'journal'));
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 3);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 3);
      });
      it('calls appendJournal for each', function() {
        assert.equal(Dummy.appendJournal.callCount, 3);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('calls disconnect', function() {
        assert.equal(Dummy.disconnect.callCount, 1);
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });

    describe('with error', function() {
      before(hooks.mockFS({migrations: migrations.fail2Down}));
      before(hooks.spyDummy);
      before(hooks.spyFiles);

      it('fails', function() {
        this.revertAll = Files.listMigrations('migrations')
          .then(Runner.revertAll('dummy', {}, 'journal'));
        return this.revertAll.then(assertFalse, R.T);
      });
      it('calls connect', function() {
        assert.equal(Dummy.connect.callCount, 1);
      });
      it('calls ensureJournal', function() {
        assert.equal(Dummy.ensureJournal.callCount, 1);
      });
      it('calls beginTransaction', function() {
        assert.equal(Dummy.beginTransaction.callCount, 1);
      });
      it('calls readDownSQL for each', function() {
        assert.equal(Files.readDownSQL.callCount, 2);
      });
      it('calls runMigrationSQL for each', function() {
        assert.equal(Dummy.runMigrationSQL.callCount, 2);
      });
      it('calls appendJournal for each success', function() {
        assert.equal(Dummy.appendJournal.callCount, 1);
      });
      it('does not call commitTransaction', function() {
        assert.equal(Dummy.commitTransaction.callCount, 0);
      });
      it('calls rollbackTransaction', function() {
        assert.equal(Dummy.rollbackTransaction.callCount, 1);
      });
      it('rethrows runMigrationSQL', function() {
        Promise.join(
          this.revertAll.then(null, R.identity),
          Dummy.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        );
      });

      after(hooks.restoreFiles);
      after(hooks.restoreDummy);
      after(hooks.restoreFS);
    });
  });
});
