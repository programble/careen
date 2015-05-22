'use strict';

import * as assert from 'assert';

import * as mockFS from 'mock-fs';
import * as sinon from 'sinon';

import { Config, loadObject } from '../../lib/config/index';
import * as files from '../../lib/files';
import * as format from '../../lib/format';
import { migrations } from '../../lib/command/index';

describe('Command migrations', function() {
  before(() =>
    mockFS({
      'migrations': {
        '1.first.sql': '---',
        '2.second.sql': '---'
      }
    })
  );

  let listMigrationsSpy: sinon.Spy;
  let formatSpy: sinon.Spy;
  let formatLongSpy: sinon.Spy;

  before(function() {
    listMigrationsSpy = sinon.spy(files, 'listMigrations');
    formatSpy = sinon.spy(format, 'formatMigration');
    formatLongSpy = sinon.spy(format, 'formatMigrationLong');
  });

  after(function() {
    listMigrationsSpy.restore();
    formatSpy.restore();
    formatLongSpy.restore();
  });

  after(mockFS.restore);

  describe('without id', function() {
    let config: Config;

    before(() => config = loadObject({}));

    it('succeeds', () => migrations(config));

    it('calls listMigrations', () => assert.equal(listMigrationsSpy.callCount, 1));
    it('calls formatMigration', () => assert.equal(formatSpy.callCount, 2));
  });

  describe('with id', function() {
    before(function() {
      listMigrationsSpy.reset();
      formatSpy.reset();
    });

    let config: Config;

    before(() => config = loadObject({commands: {migrations: {id: '2'}}}));

    it('succeeds', () => migrations(config));

    it('calls listMigrations', () => assert.equal(listMigrationsSpy.callCount, 1));
    it('calls formatMigration', () => assert.equal(formatSpy.callCount, 1));
  });

  describe('with long', function() {
    before(() => listMigrationsSpy.reset());

    let config: Config;

    before(() => config = loadObject({commands: {migrations: {long: true}}}));

    it('succeeds', () => migrations(config));

    it('calls listMigrations', () => assert.equal(listMigrationsSpy.callCount, 1));
    it('calls formatMigrationLong', () => assert.equal(formatLongSpy.callCount, 2));
  });
});
