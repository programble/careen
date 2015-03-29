'use strict';

import assert = require('assert');

import Promise = require('bluebird');

import client = require('../../lib/client/index');

interface Config {
  prettyName: string;
  skip: boolean;
  client: client.Client;
  createDatabase: () => Promise<{}>;
  dropDatabase: (config: {}) => Promise<any>;
}

function suite(t: Config) {
  var hooks = {
    createDatabase: function() {
      return this.config = t.createDatabase();
    },
    connect: function() {
      return this.db = this.config.then(t.client.connect);
    },
    beginTransaction: function() {
      return this.db.then(t.client.beginTransaction);
    },
    ensureJournal: function() {
      return Promise.join(this.db, 'journal')
        .spread(t.client.ensureJournal);
    },
    disconnect: function() {
      return this.db.then(t.client.disconnect);
    },
    dropDatabase: function() {
      return this.config.then(t.dropDatabase);
    }
  };

  (t.skip ? describe.skip : describe)(t.prettyName + ' client', function() {
    describe('connect', function() {
      before(hooks.createDatabase);

      it('succeeds', function() {
        return this.db = this.config.then(t.client.connect);
      });

      after(hooks.disconnect);
      after(hooks.dropDatabase);
    });
  });
}

export = suite;
