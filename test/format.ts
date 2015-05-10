'use strict';

import assert = require('assert');

import client = require('../lib/client/index');
import status = require('../lib/status');
import f = require('../lib/format');

describe('Format', function() {
  describe('formatOperation', function() {
    var apply: string;
    var revert: string;

    it('formats apply', () =>
      apply = f.formatOperation(client.Operation.apply)
    );
    it('formats revert', () =>
      revert = f.formatOperation(client.Operation.revert)
    );

    it('formats to same length', () =>
      assert.equal(apply.length, revert.length)
    );
  });

  describe('formatJournalEntry', function() {
    it('formats', () =>
      f.formatJournalEntry({
        timestamp: new Date(),
        operation: client.Operation.apply,
        migrationID: '1',
        migrationName: 'test'
      })
    );
  });

  describe('formatMigration', function() {
    it('formats combined', () =>
      f.formatMigration({
        id: '1',
        name: 'test',
        split: false,
        path: 'migrations/1.test.sql'
      })
    );

    it('formats split', () =>
      f.formatMigration({
        id: '1',
        name: 'test',
        split: true,
        upPath: 'migrations/1.test.up.sql',
        downPath: 'migrations/2.test.down.sql'
      })
    );
  });

  describe('formatMigrationLong', function() {
    it('formats combined', () =>
      f.formatMigrationLong({
        id: '1',
        name: 'test',
        split: false,
        path: 'migrations/1.test.sql'
      })
    );

    it('formats split', () =>
      f.formatMigrationLong({
        id: '1',
        name: 'test',
        split: true,
        upPath: 'migrations/1.test.up.sql',
        downPath: 'migrations/2.test.down.sql'
      })
    );
  });

  describe('formatState', function() {
    var pending: string;
    var applied: string;
    var reverted: string;
    var missing: string;

    it('formats pending', () => pending = f.formatState(status.State.pending));
    it('formats applied', () => applied = f.formatState(status.State.applied));
    it('formats reverted', () => reverted = f.formatState(status.State.reverted));
    it('formats missing', () => missing = f.formatState(status.State.missing));

    it('formats to same length', function() {
      assert.equal(pending.length, reverted.length);
      assert.equal(applied.length, reverted.length);
      assert.equal(missing.length, reverted.length);
    });
  });

  describe('formatMigrationState', function() {
    it('formats', () =>
      f.formatMigrationState({
        migrationID: '1',
        migrationName: 'test',
        state: status.State.pending
      })
    );
  });
});
