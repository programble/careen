'use strict';

import * as assert from 'assert';

import * as Promise from 'bluebird';
import * as sinon from 'sinon';

import { Config, loadObject } from '../../lib/config/index';
import { JournalEntry, Operation } from '../../lib/client/index';
import * as runner from '../../lib/runner';
import * as format from '../../lib/format';
import { journal } from '../../lib/command/index';

describe('Command journal', function() {
  let readJournalStub: sinon.Stub;
  let formatSpy: sinon.Spy;

  before(function() {
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
    formatSpy = sinon.spy(format, 'formatJournalEntry');
  });

  after(function() {
    readJournalStub.restore();
    formatSpy.restore();
  });

  describe('without id', function() {
    let config: Config;

    before(() => config = loadObject({}));

    it('succeeds', () => journal(config));

    it('calls readJournal', () => assert.equal(readJournalStub.callCount, 1));
    it('calls formatJournalEntry', () => assert.equal(formatSpy.callCount, 2));
  });

  describe('with id', function() {
    before(function() {
      readJournalStub.reset();
      formatSpy.reset();
    });

    let config: Config;

    before(() => config = loadObject({commands: {journal: {id: '2'}}}));

    it('succeeds', () => journal(config));

    it('calls readJournal', () => assert.equal(readJournalStub.callCount, 1));
    it('calls formatJournalEntry', () => assert.equal(formatSpy.callCount, 1));
  });
});
