'use strict';

import * as assert from 'assert';

import * as Promise from 'bluebird';
import * as sinon from 'sinon';

import { Config, loadObject } from '../../lib/config/index';
import * as files from '../../lib/files';
import { JournalEntry, Operation } from '../../lib/client/index';
import * as runner from '../../lib/runner';
import * as format from '../../lib/format';
import * as status from '../../lib/status';
import { status as statusCommand } from '../../lib/command/index';

describe('Command status', function() {
  let listMigrationsStub: sinon.Stub;
  let readJournalStub: sinon.Stub;
  let getMigrationStatesSpy: sinon.Spy;
  let formatSpy: sinon.Spy;

  before(function() {
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
        }
      ])
    );

    readJournalStub = sinon.stub(runner, 'readJournal', () =>
      Promise.resolve<JournalEntry[]>([
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
        }
      ])
    );

    getMigrationStatesSpy = sinon.spy(status, 'getMigrationStates');

    formatSpy = sinon.spy(format, 'formatMigrationState');
  });

  after(function() {
    listMigrationsStub.restore();
    readJournalStub.restore();
    getMigrationStatesSpy.restore();
    formatSpy.restore();
  });

  describe('without id', function() {
    let config: Config;

    before(() => config = loadObject({}));

    it('succeeds', () => statusCommand(config));

    it('calls listMigrations', () => assert.equal(listMigrationsStub.callCount, 1));
    it('calls readJournal', () => assert.equal(readJournalStub.callCount, 1));
    it('calls getMigrationStates', () => 
      assert.equal(getMigrationStatesSpy.callCount, 1)
    );
    it('calls formatMigrationState', () => assert.equal(formatSpy.callCount, 2));
  });

  describe('with id', function() {
    before(function() {
      listMigrationsStub.reset();
      readJournalStub.reset();
      getMigrationStatesSpy.reset();
      formatSpy.reset();
    });

    let config: Config;

    before(() => config = loadObject({commands: {status: {id: '2'}}}));

    it('succeeds', () => statusCommand(config));

    it('calls listMigrations', () => assert.equal(listMigrationsStub.callCount, 1));
    it('calls readJournal', () => assert.equal(readJournalStub.callCount, 1));
    it('calls getMigrationStates', () => 
      assert.equal(getMigrationStatesSpy.callCount, 1)
    );
    it('calls formatMigrationState', () => assert.equal(formatSpy.callCount, 1));
  });
});
