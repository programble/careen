'use strict';

import * as assert from 'assert';

import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as sinon from 'sinon';
import * as mockFS from 'mock-fs';

import * as files from '../lib/files';
import * as client from '../lib/client/index';
import * as dummy from '../lib/client/dummy';
import * as runner from '../lib/runner';

const migrationFiles = {
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
  let spies: {
    [s: string]: sinon.Spy;
    connect?: sinon.Spy; ensureJournal?: sinon.Spy; readJournal?: sinon.Spy;
    beginTransaction?: sinon.Spy; runMigrationSQL?: sinon.Spy;
    appendJournal?: sinon.Spy; rollbackTransaction?: sinon.Spy;
    commitTransaction?: sinon.Spy; disconnect?: sinon.Spy;
    readUpSQL?: sinon.Spy; readDownSQL?: sinon.Spy;
  } = {};

  let resetSpies = () => R.forEach(spy => spy.reset(), R.values(spies));

  before(function() {
    R.forEach(method => spies[method] = sinon.spy(dummy, method), [
      'connect', 'ensureJournal', 'readJournal', 'beginTransaction',
      'runMigrationSQL', 'appendJournal', 'rollbackTransaction',
      'commitTransaction', 'disconnect'
    ]);
    spies.readUpSQL = sinon.spy(files, 'readUpSQL');
    spies.readDownSQL = sinon.spy(files, 'readDownSQL');
  });

  after(function() {
    R.forEach(spy => spy.restore(), R.values(spies));
  });

  describe('readJournal', function() {
    before(resetSpies);

    it('succeeds', () =>
      runner.readJournal('dummy', {}, 'journal')
    );

    it('calls connect', () =>
      assert.equal(spies.connect.callCount, 1)
    );
    it('calls ensureJournal', () =>
      assert.equal(spies.ensureJournal.callCount, 1)
    );
    it('calls readJournal', () =>
      assert.equal(spies.readJournal.callCount, 1)
    );
    it('calls disconnect', () =>
      assert.equal(spies.disconnect.callCount, 1)
    );
  });

  describe('applyEach', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.applyEach('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction for each', () =>
        assert.equal(spies.beginTransaction.callCount, 3)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('calls commitTransaction for each', () =>
        assert.equal(spies.commitTransaction.callCount, 3)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Up}));
      before(resetSpies);

      let applyEach: Promise<any>;

      it('fails', function() {
        applyEach = files.listMigrations('migrations').then(migrations =>
          runner.applyEach('dummy', {}, 'journal', migrations)
        );
        return applyEach.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction for each', () =>
        assert.equal(spies.beginTransaction.callCount, 2)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('calls commitTransaction for each success', () =>
        assert.equal(spies.commitTransaction.callCount, 1)
      );
      it('calls rollbackTransaction for failure', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          applyEach.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });

  describe('applyAll', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.applyAll('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('calls commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Up}));
      before(resetSpies);

      let applyAll: Promise<any>;

      it('fails', function() {
        applyAll = files.listMigrations('migrations').then(migrations =>
          runner.applyAll('dummy', {}, 'journal', migrations)
        );
        return applyAll.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          applyAll.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });

  describe('applyDry', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.applyDry('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Up}));
      before(resetSpies);

      let applyDry: Promise<any>;

      it('fails', function() {
        applyDry = files.listMigrations('migrations').then(migrations =>
          runner.applyDry('dummy', {}, 'journal', migrations)
        );
        return applyDry.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readUpSQL for each', () =>
        assert.equal(spies.readUpSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          applyDry.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });

  describe('revertEach', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.revertEach('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction for each', () =>
        assert.equal(spies.beginTransaction.callCount, 3)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('calls commitTransaction for each', () =>
        assert.equal(spies.commitTransaction.callCount, 3)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Down}));
      before(resetSpies);

      let revertEach: Promise<any>;

      it('fails', function() {
        revertEach = files.listMigrations('migrations').then(migrations =>
          runner.revertEach('dummy', {}, 'journal', migrations)
        );
        return revertEach.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction for each', () =>
        assert.equal(spies.beginTransaction.callCount, 2)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('calls commitTransaction for each success', () =>
        assert.equal(spies.commitTransaction.callCount, 1)
      );
      it('calls rollbackTransaction for failure', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          revertEach.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });

  describe('revertAll', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.revertAll('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('calls commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Down}));
      before(resetSpies);

      let revertAll: Promise<any>;

      it('fails', function() {
        revertAll = files.listMigrations('migrations').then(migrations =>
          runner.revertAll('dummy', {}, 'journal', migrations)
        );
        return revertAll.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          revertAll.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });

  describe('revertDry', function() {
    describe('without error', function() {
      before(() => mockFS({migrations: migrationFiles.success3}));
      before(resetSpies);

      it('succeeds', () =>
        files.listMigrations('migrations').then(migrations =>
          runner.revertDry('dummy', {}, 'journal', migrations)
        )
      );

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 3)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 3)
      );
      it('calls appendJournal for each', () =>
        assert.equal(spies.appendJournal.callCount, 3)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(spies.readJournal.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      after(mockFS.restore);
    });

    describe('with error', function() {
      before(() => mockFS({migrations: migrationFiles.fail2Down}));
      before(resetSpies);

      let revertDry: Promise<any>;

      it('fails', function() {
        revertDry = files.listMigrations('migrations').then(migrations =>
          runner.revertDry('dummy', {}, 'journal', migrations)
        );
        return revertDry.then(R.F, R.T).then(assert);
      });

      it('calls connect', () =>
        assert.equal(spies.connect.callCount, 1)
      );
      it('calls ensureJournal', () =>
        assert.equal(spies.ensureJournal.callCount, 1)
      );
      it('calls beginTransaction', () =>
        assert.equal(spies.beginTransaction.callCount, 1)
      );
      it('calls readDownSQL for each', () =>
        assert.equal(spies.readDownSQL.callCount, 2)
      );
      it('calls runMigrationSQL for each', () =>
        assert.equal(spies.runMigrationSQL.callCount, 2)
      );
      it('calls appendJournal for each success', () =>
        assert.equal(spies.appendJournal.callCount, 1)
      );
      it('does not call commitTransaction', () =>
        assert.equal(spies.commitTransaction.callCount, 0)
      );
      it('calls rollbackTransaction', () =>
        assert.equal(spies.rollbackTransaction.callCount, 1)
      );
      it('calls disconnect', () =>
        assert.equal(spies.disconnect.callCount, 1)
      );

      it('rethrows runMigrationSQL', () =>
        Promise.join(
          revertDry.then(null, R.identity),
          spies.runMigrationSQL.secondCall.returnValue.then(null, R.identity),
          assert.equal
        )
      );

      after(mockFS.restore);
    });
  });
});
