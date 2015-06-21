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
import revert from '../../lib/command/revert';

function migrationToEntry(migration: files.Migration): JournalEntry {
  return {
    timestamp: new Date(),
    operation: Operation.revert,
    migrationID: migration.id,
    migrationName: migration.name
  };
}

describe('Command revert', () => {
  let listMigrationsStub: sinon.Stub;
  let readJournalStub: sinon.Stub;
  let getMigrationStatesSpy: sinon.Spy;
  let revertAllStub: sinon.Stub;
  let revertEachStub: sinon.Stub;
  let revertDryStub: sinon.Stub;
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
        },
        {
          id: '4',
          name: 'fourth',
          split: false,
          path: 'migrations/4.fourth.sql'
        }
      ])
    );

    let entries: JournalEntry[] = [
      {
        timestamp: new Date(),
        operation: Operation.apply,
        migrationID: '1',
        migrationName: 'first'
      },
      {
        timestamp: new Date(),
        operation: Operation.apply,
        migrationID: '2',
        migrationName: 'second'
      },
      {
        timestamp: new Date(),
        operation: Operation.apply,
        migrationID: '3',
        migrationName: 'fourth'
      }
    ];

    readJournalStub = sinon.stub(runner, 'readJournal', () =>
      Promise.resolve(entries)
    );

    getMigrationStatesSpy = sinon.spy(status, 'getMigrationStates');

    let revertFn = (n: string, c: Config, j: string, ms: files.Migration[]) =>
      Promise.resolve(R.concat(entries, R.map(migrationToEntry, ms)));

    revertAllStub = sinon.stub(runner, 'revertAll', revertFn);
    revertEachStub = sinon.stub(runner, 'revertEach', revertFn);
    revertDryStub = sinon.stub(runner, 'revertDry', revertFn);

    formatSpy = sinon.spy(format, 'formatJournalEntry');
  });

  after(() => {
    listMigrationsStub.restore();
    readJournalStub.restore();
    getMigrationStatesSpy.restore();
    revertAllStub.restore();
    revertEachStub.restore();
    revertDryStub.restore();
    formatSpy.restore()
  });

  let resetSpies = () => {
    listMigrationsStub.reset();
    readJournalStub.reset();
    getMigrationStatesSpy.reset();
    revertAllStub.reset();
    revertEachStub.reset();
    revertDryStub.reset();
    formatSpy.reset()
  };

  describe('to', () => {
    describe('all', () => {
      it('succeeds', () =>
        revert(loadObject({commands: {revert: {method: 'all', to: '1'}}}))
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

      it('calls revertAll with migrations', () => {
        assert.equal(revertAllStub.callCount, 1);

        let migrations = revertAllStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '3');
        assert.equal(migrations[1].id, '2');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });

    describe('each', () => {
      before(resetSpies);

      it('succeeds', () =>
        revert(loadObject({commands: {revert: {method: 'each', to: '1'}}}))
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

      it('calls revertEach with migrations', () => {
        assert.equal(revertEachStub.callCount, 1);

        let migrations = revertEachStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '3');
        assert.equal(migrations[1].id, '2');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });

    describe('dry', () => {
      before(resetSpies);

      it('succeeds', () =>
        revert(loadObject({commands: {revert: {method: 'dry', to: '1'}}}))
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

      it('calls revertDry with migrations', () => {
        assert.equal(revertDryStub.callCount, 1);

        let migrations = revertDryStub.firstCall.args[3];
        assert.equal(migrations.length, 2);
        assert.equal(migrations[0].id, '3');
        assert.equal(migrations[1].id, '2');
      });

      it('calls formatJournalEntry for new entries', () =>
        assert.equal(formatSpy.callCount, 2)
      );
    });
  });

  describe('migration ID', () => {
    before(resetSpies);

    it('succeeds', () =>
      revert(loadObject({commands: {revert: {id: '2'}}}))
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

    it('calls revertAll with migration', () => {
      assert.equal(revertAllStub.callCount, 1);

      let migrations = revertAllStub.firstCall.args[3];
      assert.equal(migrations.length, 1);
      assert.equal(migrations[0].id, '2');
    });

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 1)
    );
  });

  describe('number', () => {
    before(resetSpies);

    it('succeeds', () =>
      revert(loadObject({commands: {revert: {number: 1}}}))
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

    it('calls revertAll with migrations', () => {
      assert.equal(revertAllStub.callCount, 1);

      let migrations = revertAllStub.firstCall.args[3];
      assert.equal(migrations.length, 1);
      assert.equal(migrations[0].id, '3');
    });

    it('calls formatJournalEntry for new entries', () =>
      assert.equal(formatSpy.callCount, 1)
    );
  });
});
