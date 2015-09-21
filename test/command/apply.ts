'use strict';

import * as assert from 'assert';

import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as sinon from 'sinon';

import { Config, loadObject } from '../../lib/config/index';
import * as files from '../../lib/files';
import { JournalEntry, Operation } from '../../lib/client/index';
import * as runner from '../../lib/runner';
import * as format from '../../lib/format';
import * as status from '../../lib/status';
import apply from '../../lib/command/apply';

function migrationToEntry(migration: files.Migration): JournalEntry {
  return {
    timestamp: new Date(),
    operation: Operation.apply,
    migrationID: migration.id,
    migrationName: migration.name
  };
}

describe('Command apply', () => {
  let listMigrationsStub: sinon.Stub;
  let readJournalStub: sinon.Stub;
  let getMigrationStatesSpy: sinon.Spy;
  let applyAllStub: sinon.Stub;
  let applyEachStub: sinon.Stub;
  let applyDryStub: sinon.Stub;
  let formatSpy: sinon.Spy;

  before(() => {
    listMigrationsStub = sinon.stub(files, 'listMigrations', () =>
      Promise.resolve<files.Migration[]>([
        {
          id: '1',
          name: 'first',
          split: false,
          path: 'migrations/1.first.sql'
        },
        {
          id: '2',
          name: 'second',
          split: false,
          path: 'migrations/2.second.sql'
        },
        {
          id: '3',
          name: 'third',
          split: false,
          path: 'migrations/3.third.sql'
        }
      ])
    );

    let entries: JournalEntry[] = [
      {
        timestamp: new Date(),
        operation: Operation.apply,
        migrationID: '1',
        migrationName: 'first'
      }
    ];

    readJournalStub = sinon.stub(runner, 'readJournal', () =>
      Promise.resolve(entries)
    );

    getMigrationStatesSpy = sinon.spy(status, 'getMigrationStates');

    let applyFn = (n: string, c: Config, j: string, ms: files.Migration[]) =>
      Promise.resolve(R.concat(entries, R.map(migrationToEntry, ms)));

    applyAllStub = sinon.stub(runner, 'applyAll', applyFn);
    applyEachStub = sinon.stub(runner, 'applyEach', applyFn);
    applyDryStub = sinon.stub(runner, 'applyDry', applyFn);

    formatSpy = sinon.spy(format, 'formatJournalEntry');
  });

  after(() => {
    listMigrationsStub.restore();
    readJournalStub.restore();
    getMigrationStatesSpy.restore();
    applyAllStub.restore();
    applyEachStub.restore();
    applyDryStub.restore();
    formatSpy.restore()
  });

  let resetSpies = () => {
    listMigrationsStub.reset();
    readJournalStub.reset();
    getMigrationStatesSpy.reset();
    applyAllStub.reset();
    applyEachStub.reset();
    applyDryStub.reset();
    formatSpy.reset()
  };

  describe('pending', () => {
    describe('all', () => {
      it('succeeds', () =>
        apply(loadObject({commands: {apply: {method: 'all', pending: true}}}))
      );

      it('calls listMigrations', () =>
        assert.equal(listMigrationsStub.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(readJournalStub.callCount, 1)
      );
      it('calls getMigrationStates', () =>
        assert.equal(getMigrationStatesSpy.callCount, 1)
      );

      it('calls applyAll with pending migrations', () => {
        assert.equal(applyAllStub.callCount, 1);

        let migrations = applyAllStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '2');
        assert.equal(migrations[1].id, '3');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });

    describe('each', () => {
      before(resetSpies);

      it('succeeds', () =>
        apply(loadObject({commands: {apply: {method: 'each', pending: true}}}))
      );

      it('calls listMigrations', () =>
        assert.equal(listMigrationsStub.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(readJournalStub.callCount, 1)
      );
      it('calls getMigrationStates', () =>
        assert.equal(getMigrationStatesSpy.callCount, 1)
      );

      it('calls applyEach with pending migrations', () => {
        assert.equal(applyEachStub.callCount, 1);

        let migrations = applyEachStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '2');
        assert.equal(migrations[1].id, '3');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });

    describe('dry', () => {
      before(resetSpies);

      it('succeeds', () =>
        apply(loadObject({commands: {apply: {method: 'dry', pending: true}}}))
      );

      it('calls listMigrations', () =>
        assert.equal(listMigrationsStub.callCount, 1)
      );
      it('calls readJournal', () =>
        assert.equal(readJournalStub.callCount, 1)
      );
      it('calls getMigrationStates', () =>
        assert.equal(getMigrationStatesSpy.callCount, 1)
      );

      it('calls applyDry with pending migrations', () => {
        assert.equal(applyDryStub.callCount, 1);

        let migrations = applyDryStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '2');
        assert.equal(migrations[1].id, '3');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });
  });

  describe('migration ID', () => {
    before(resetSpies);

    it('succeeds', () =>
      apply(loadObject({commands: {apply: {id: '2'}}}))
    );

    it('calls listMigrations', () =>
      assert.equal(listMigrationsStub.callCount, 1)
    );
    it('calls readJournal', () =>
      assert.equal(readJournalStub.callCount, 1)
    );
    it('calls getMigrationStates', () =>
      assert.equal(getMigrationStatesSpy.callCount, 1)
    );

    it('calls applyAll with migration', () => {
      assert.equal(applyAllStub.callCount, 1);

      let migrations = applyAllStub.firstCall.args[3];
      assert.equal(migrations.length, 1);
      assert.equal(migrations[0].id, '2');
    });

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 1)
    );
  });

  describe('to', () => {
    before(resetSpies);

    it('succeeds', () =>
      apply(loadObject({commands: {apply: {to: '3'}}}))
    );

    it('calls listMigrations', () =>
      assert.equal(listMigrationsStub.callCount, 1)
    );
    it('calls readJournal', () =>
      assert.equal(readJournalStub.callCount, 1)
    );
    it('calls getMigrationStates', () =>
      assert.equal(getMigrationStatesSpy.callCount, 1)
    );

    it('calls applyAll with migrations', () => {
      assert.equal(applyAllStub.callCount, 1);

      let migrations = applyAllStub.firstCall.args[3];
      assert.equal(migrations.length, 2);
      assert.equal(migrations[0].id, '2');
      assert.equal(migrations[1].id, '3');
    });

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 2)
    );
  });

  describe('number', () => {
    before(resetSpies);

    it('succeeds', () =>
      apply(loadObject({commands: {apply: {number: 1}}}))
    );

    it('calls listMigrations', () =>
      assert.equal(listMigrationsStub.callCount, 1)
    );
    it('calls readJournal', () =>
      assert.equal(readJournalStub.callCount, 1)
    );
    it('calls getMigrationStates', () =>
      assert.equal(getMigrationStatesSpy.callCount, 1)
    );

    it('calls applyAll with migrations', () => {
      assert.equal(applyAllStub.callCount, 1);

      let migrations = applyAllStub.firstCall.args[3];
      assert.equal(migrations.length, 1);
      assert.equal(migrations[0].id, '2');
    });

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 1)
    );
  });

  describe('with empty journal', () => {
    before(resetSpies);

    before(() => {
      readJournalStub.restore();
      readJournalStub = sinon.stub(runner, 'readJournal', () =>
        Promise.resolve([])
      );

      applyAllStub.restore();
      applyAllStub = sinon.stub(
        runner,
        'applyAll',
        (n: string, c: Config, j: string, ms: files.Migration[]) =>
          Promise.resolve(R.map(migrationToEntry, ms))
      );
    });

    it('succeeds', () =>
      apply(loadObject({commands: {apply: {pending: true}}}))
    );

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 3)
    );
  });
});
