'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import * as mockFS from 'mock-fs';
import * as sinon from 'sinon';

import { Config, DEFAULTS, loadObject } from '../../lib/config/index';
import * as files from '../../lib/files';
import * as format from '../../lib/format';
import { create } from '../../lib/command/index';

describe('Command create', function() {
  describe('combined', function() {
    before(() => mockFS({'combined.sql': '---'}));

    let config: Config;

    before(() =>
      config = loadObject({
        commands: {create: {templatePaths: {combined: 'combined.sql'}}}
      })
    );

    let generateIDSpy: sinon.Spy;
    let ensureDirectorySpy: sinon.Spy;
    let readFileSpy: sinon.Spy;
    let createSpy: sinon.Spy;
    let formatSpy: sinon.Spy;

    before(function() {
      generateIDSpy = sinon.spy(config.commands.create, 'generateID');
      ensureDirectorySpy = sinon.spy(files, 'ensureDirectory');
      readFileSpy = sinon.spy(fs, 'readFile');
      createSpy = sinon.spy(files, 'create');
      formatSpy = sinon.spy(format, 'formatMigrationLong');
    });

    it('succeeds', () => create(config));

    it('generates an ID', () => assert.equal(generateIDSpy.callCount, 1));
    it('ensures directory', () => assert.equal(ensureDirectorySpy.callCount, 1));
    it('reads template file', () => assert.equal(readFileSpy.callCount, 1));
    it('creates migration', () => assert.equal(createSpy.callCount, 1));
    it('formats migration', () => assert.equal(formatSpy.callCount, 1));

    after(function() {
      generateIDSpy.restore();
      ensureDirectorySpy.restore();
      readFileSpy.restore();
      createSpy.restore();
      formatSpy.restore();
    });

    after(mockFS.restore);
  });

  describe('split', function() {
    before(() => mockFS({'up.sql': '', 'down.sql': ''}));

    let config: Config;

    before(() =>
      config = loadObject({
        commands: {
          create: {
            split: true,
            templatePaths: {up: 'up.sql', down: 'down.sql'}
          }
        }
      })
    );

    let generateIDSpy: sinon.Spy;
    let ensureDirectorySpy: sinon.Spy;
    let readFileSpy: sinon.Spy;
    let createSpy: sinon.Spy;
    let formatSpy: sinon.Spy;

    before(function() {
      generateIDSpy = sinon.spy(config.commands.create, 'generateID');
      ensureDirectorySpy = sinon.spy(files, 'ensureDirectory');
      readFileSpy = sinon.spy(fs, 'readFile');
      createSpy = sinon.spy(files, 'createSplit');
      formatSpy = sinon.spy(format, 'formatMigrationLong');
    });

    it('succeeds', () => create(config));

    it('generates an ID', () => assert.equal(generateIDSpy.callCount, 1));
    it('ensures directory', () => assert.equal(ensureDirectorySpy.callCount, 1));
    it('reads template files', () => assert.equal(readFileSpy.callCount, 2));
    it('creates migration', () => assert.equal(createSpy.callCount, 1));
    it('formats migration', () => assert.equal(formatSpy.callCount, 1));

    after(function() {
      generateIDSpy.restore();
      ensureDirectorySpy.restore();
      readFileSpy.restore();
      createSpy.restore();
      formatSpy.restore();
    });

    after(mockFS.restore);
  });
});
