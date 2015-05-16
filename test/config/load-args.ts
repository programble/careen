'use strict';

import assert = require('assert');

import mockFS = require('mock-fs');

import config = require('../../lib/config/index');

describe('Config loadArgs', function() {
  describe('with explicit defaults', function() {
    let testDefaults: config.Config;

    before(() => testDefaults = config.loadObject({command: 'journal'}));

    it('inherits defaults', function() {
      let testConfig = config.loadArgs([], testDefaults);
      assert.equal(testConfig.command, config.Command.journal);
    });
  });

  describe('-c, --config', function() {
    before(() => mockFS({'test.json': '{"command":"journal"}'}));

    describe('--config', function() {
      it('loads file', function() {
        let testConfig = config.loadArgs(['--config', 'test.json']);
        assert.equal(testConfig.command, config.Command.journal);
      });
    });

    describe('-c', function() {
      it('loads file', function() {
        let testConfig = config.loadArgs(['-c', 'test.json']);
        assert.equal(testConfig.command, config.Command.journal);
      });
    });

    after(mockFS.restore);
  });

  describe('--client', function() {
    it('sets client name', function() {
      let testConfig = config.loadArgs(['--client', 'sqlite3']);
      assert.equal(testConfig.client.name, 'sqlite3');
    });
  });

  describe('--client-config', function() {
    describe('with JSON string', function() {
      it('sets client config', function() {
        let testConfig = config.loadArgs(['--client-config', '{"foo":"bar"}']);
        assert.deepEqual(testConfig.client.config, {foo: 'bar'});
      });
    });

    describe('as object', function() {
      it('sets client config', function() {
        let testConfig = config.loadArgs(['--client-config.foo', 'bar']);
        assert.deepEqual(testConfig.client.config, {foo: 'bar'});
      });
    });
  });

  describe('--journal-table', function() {
    it('sets client journalTable', function() {
      let testConfig = config.loadArgs(['--journal-table', 'test']);
      assert.equal(testConfig.client.journalTable, 'test');
    });
  });

  describe('--directory', function() {
    it('sets files directory', function() {
      let testConfig = config.loadArgs(['--directory', 'test']);
      assert.equal(testConfig.files.directory, 'test');
    });
  });

  describe('--status', function() {
    it('sets command to status', function() {
      let testConfig = config.loadArgs(['--status']);
      assert.equal(testConfig.command, config.Command.status);
    });
  });

  describe('-S', function() {
    it('sets command to status', function() {
      let testConfig = config.loadArgs(['-S']);
      assert.equal(testConfig.command, config.Command.status);
    });
  });

  describe('--migrations', function() {
    it('sets command to migrations', function() {
      let testConfig = config.loadArgs(['--migrations']);
      assert.equal(testConfig.command, config.Command.migrations);
    });
  });

  describe('-M', function() {
    it('sets command to migrations', function() {
      let testConfig = config.loadArgs(['-M']);
      assert.equal(testConfig.command, config.Command.migrations);
    });
  });

  describe('--journal', function() {
    it('sets command to journal', function() {
      let testConfig = config.loadArgs(['--journal']);
      assert.equal(testConfig.command, config.Command.journal);
    });
  });

  describe('-J', function() {
    it('sets command to journal', function() {
      let testConfig = config.loadArgs(['-J']);
      assert.equal(testConfig.command, config.Command.journal);
    });
  });

  describe('--create', function() {
    it('sets command to create', function() {
      let testConfig = config.loadArgs(['--create']);
      assert.equal(testConfig.command, config.Command.create);
    });
  });

  describe('-C', function() {
    it('sets command to create', function() {
      let testConfig = config.loadArgs(['-C']);
      assert.equal(testConfig.command, config.Command.create);
    });
  });

  describe('--apply', function() {
    it('sets command to apply', function() {
      let testConfig = config.loadArgs(['--apply']);
      assert.equal(testConfig.command, config.Command.apply);
    });
  });

  describe('-A', function() {
    it('sets command to apply', function() {
      let testConfig = config.loadArgs(['-A']);
      assert.equal(testConfig.command, config.Command.apply);
    });
  });

  describe('--revert', function() {
    it('sets command to revert', function() {
      let testConfig = config.loadArgs(['--revert']);
      assert.equal(testConfig.command, config.Command.revert);
    });
  });

  describe('-R', function() {
    it('sets command to revert', function() {
      let testConfig = config.loadArgs(['-R']);
      assert.equal(testConfig.command, config.Command.revert);
    });
  });

  describe('--status --id', function() {
    it('sets commands status id', function() {
      let testConfig = config.loadArgs(['--status', '--id', '123']);
      assert.equal(testConfig.commands.status.id, '123');
    });
  });

  describe('--status -i', function() {
    it('sets commands status id', function() {
      let testConfig = config.loadArgs(['--status', '-i', '123']);
      assert.equal(testConfig.commands.status.id, '123');
    });
  });

  describe('--migrations --long', function() {
    it('sets commands migrations long', function() {
      let testConfig = config.loadArgs(['--migrations', '--long']);
      assert.equal(testConfig.commands.migrations.long, true);
    });
  });

  describe('--migrations -l', function() {
    it('sets commands migrations long', function() {
      let testConfig = config.loadArgs(['--migrations', '-l']);
      assert.equal(testConfig.commands.migrations.long, true);
    });
  });

  describe('--migrations --id', function() {
    it('sets commands migrations id', function() {
      let testConfig = config.loadArgs(['--migrations', '--id', '123']);
      assert.equal(testConfig.commands.migrations.id, '123');
    });
  });

  describe('--migrations -i', function() {
    it('sets commands migrations id', function() {
      let testConfig = config.loadArgs(['--migrations', '-i', '123']);
      assert.equal(testConfig.commands.migrations.id, '123');
    });
  });

  describe('--journal --id', function() {
    it('sets commands journal id', function() {
      let testConfig = config.loadArgs(['--journal', '--id', '123']);
      assert.equal(testConfig.commands.journal.id, '123');
    });
  });

  describe('--journal -i', function() {
    it('sets commands journal id', function() {
      let testConfig = config.loadArgs(['--journal', '-i', '123']);
      assert.equal(testConfig.commands.journal.id, '123');
    });
  });

  describe('--create --combined', function() {
    it('sets commands create split to false', function() {
      let testConfig = config.loadArgs(['--create', '--combined']);
      assert.equal(testConfig.commands.create.split, false);
    });
  });

  describe('--create -u', function() {
    it('sets commands create split to false', function() {
      let testConfig = config.loadArgs(['--create', '-u']);
      assert.equal(testConfig.commands.create.split, false);
    });
  });

  describe('--create --split', function() {
    it('sets commands create split to true', function() {
      let testConfig = config.loadArgs(['--create', '--split']);
      assert.equal(testConfig.commands.create.split, true);
    });
  });

  describe('--create -s', function() {
    it('sets commands create split to true', function() {
      let testConfig = config.loadArgs(['--create', '-s']);
      assert.equal(testConfig.commands.create.split, true);
    });
  });

  describe('--create --template', function() {
    it('sets commands create templatePaths combined', function() {
      let testConfig = config.loadArgs(['--create', '--template', 'test.sql']);
      assert.equal(testConfig.commands.create.templatePaths.combined, 'test.sql');
    });
  });

  describe('--create --up-template', function() {
    it('sets commands create templatePaths up', function() {
      let testConfig = config.loadArgs(['--create', '--up-template', 'test.sql']);
      assert.equal(testConfig.commands.create.templatePaths.up, 'test.sql');
    });
  });

  describe('--create --down-template', function() {
    it('sets commands create templatePaths down', function() {
      let testConfig = config.loadArgs(['--create', '--down-template', 'test.sql']);
      assert.equal(testConfig.commands.create.templatePaths.down, 'test.sql');
    });
  });

  describe('--create name', function() {
    it('sets commands create name', function() {
      let testConfig = config.loadArgs(['--create', 'test', 'migration']);
      assert.equal(testConfig.commands.create.name, 'test-migration');
    });
  });

  describe('--apply --all', function() {
    it('sets commands apply method to all', function() {
      let testConfig = config.loadArgs(['--apply', '--all']);
      assert.equal(testConfig.commands.apply.method, config.Method.all);
    });
  });

  describe('--apply -a', function() {
    it('sets commands apply method to all', function() {
      let testConfig = config.loadArgs(['--apply', '-a']);
      assert.equal(testConfig.commands.apply.method, config.Method.all);
    });
  });

  describe('--apply --each', function() {
    it('sets commands apply method to each', function() {
      let testConfig = config.loadArgs(['--apply', '--each']);
      assert.equal(testConfig.commands.apply.method, config.Method.each);
    });
  });

  describe('--apply -e', function() {
    it('sets commands apply method to each', function() {
      let testConfig = config.loadArgs(['--apply', '-e']);
      assert.equal(testConfig.commands.apply.method, config.Method.each);
    });
  });

  describe('--apply --dry', function() {
    it('sets commands apply method to dry', function() {
      let testConfig = config.loadArgs(['--apply', '--dry']);
      assert.equal(testConfig.commands.apply.method, config.Method.dry);
    });
  });

  describe('--apply -d', function() {
    it('sets commands apply method to dry', function() {
      let testConfig = config.loadArgs(['--apply', '-d']);
      assert.equal(testConfig.commands.apply.method, config.Method.dry);
    });
  });

  describe('--apply --pending', function() {
    it('sets commands apply pending', function() {
      let testConfig = config.loadArgs(['--apply', '--pending']);
      assert.equal(testConfig.commands.apply.pending, true);
    });
  });

  describe('--apply -p', function() {
    it('sets commands apply pending', function() {
      let testConfig = config.loadArgs(['--apply', '-p']);
      assert.equal(testConfig.commands.apply.pending, true);
    });
  });

  describe('--apply --id', function() {
    it('sets commands apply id', function() {
      let testConfig = config.loadArgs(['--apply', '--id', '123']);
      assert.equal(testConfig.commands.apply.id, '123');
    });
  });

  describe('--apply -i', function() {
    it('sets commands apply id', function() {
      let testConfig = config.loadArgs(['--apply', '-i', '123']);
      assert.equal(testConfig.commands.apply.id, '123');
    });
  });

  describe('--apply --to', function() {
    it('sets commands apply to', function() {
      let testConfig = config.loadArgs(['--apply', '--to', '123']);
      assert.equal(testConfig.commands.apply.to, '123');
    });
  });

  describe('--apply -t', function() {
    it('sets commands apply to', function() {
      let testConfig = config.loadArgs(['--apply', '-t', '123']);
      assert.equal(testConfig.commands.apply.to, '123');
    });
  });

  describe('--apply --number', function() {
    it('sets commands number', function() {
      let testConfig = config.loadArgs(['--apply', '--number', '3']);
      assert.equal(testConfig.commands.apply.number, 3);
    });
  });

  describe('--apply -n', function() {
    it('sets commands number', function() {
      let testConfig = config.loadArgs(['--apply', '-n', '3']);
      assert.equal(testConfig.commands.apply.number, 3);
    });
  });

  describe('--revert --all', function() {
    it('sets commands revert method to all', function() {
      let testConfig = config.loadArgs(['--revert', '--all']);
      assert.equal(testConfig.commands.revert.method, config.Method.all);
    });
  });

  describe('--revert -a', function() {
    it('sets commands revert method to all', function() {
      let testConfig = config.loadArgs(['--revert', '-a']);
      assert.equal(testConfig.commands.revert.method, config.Method.all);
    });
  });

  describe('--revert --each', function() {
    it('sets commands revert method to each', function() {
      let testConfig = config.loadArgs(['--revert', '--each']);
      assert.equal(testConfig.commands.revert.method, config.Method.each);
    });
  });

  describe('--revert -e', function() {
    it('sets commands revert method to each', function() {
      let testConfig = config.loadArgs(['--revert', '-e']);
      assert.equal(testConfig.commands.revert.method, config.Method.each);
    });
  });

  describe('--revert --dry', function() {
    it('sets commands revert method to dry', function() {
      let testConfig = config.loadArgs(['--revert', '--dry']);
      assert.equal(testConfig.commands.revert.method, config.Method.dry);
    });
  });

  describe('--revert -d', function() {
    it('sets commands revert method to dry', function() {
      let testConfig = config.loadArgs(['--revert', '-d']);
      assert.equal(testConfig.commands.revert.method, config.Method.dry);
    });
  });

  describe('--revert --id', function() {
    it('sets commands revert id', function() {
      let testConfig = config.loadArgs(['--revert', '--id', '123']);
      assert.equal(testConfig.commands.revert.id, '123');
    });
  });

  describe('--revert -i', function() {
    it('sets commands revert id', function() {
      let testConfig = config.loadArgs(['--revert', '-i', '123']);
      assert.equal(testConfig.commands.revert.id, '123');
    });
  });

  describe('--revert --to', function() {
    it('sets commands revert to', function() {
      let testConfig = config.loadArgs(['--revert', '--to', '123']);
      assert.equal(testConfig.commands.revert.to, '123');
    });
  });

  describe('--revert -t', function() {
    it('sets commands revert to', function() {
      let testConfig = config.loadArgs(['--revert', '-t', '123']);
      assert.equal(testConfig.commands.revert.to, '123');
    });
  });

  describe('--revert --number', function() {
    it('sets commands number', function() {
      let testConfig = config.loadArgs(['--revert', '--number', '3']);
      assert.equal(testConfig.commands.revert.number, 3);
    });
  });

  describe('--revert -n', function() {
    it('sets commands number', function() {
      let testConfig = config.loadArgs(['--revert', '-n', '3']);
      assert.equal(testConfig.commands.revert.number, 3);
    });
  });

  describe('--help', function() {
    it('sets command to help', function() {
      let testConfig = config.loadArgs(['--help']);
      assert.equal(testConfig.command, config.Command.help);
    });
  });

  describe('-h', function() {
    it('sets command to help', function() {
      let testConfig = config.loadArgs(['-h']);
      assert.equal(testConfig.command, config.Command.help);
    });
  });

  describe('--version', function() {
    it('sets command to version', function() {
      let testConfig = config.loadArgs(['--version']);
      assert.equal(testConfig.command, config.Command.version);
    });
  });
});
