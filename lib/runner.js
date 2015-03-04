'use strict';

/**
 * Migration runner.
 * @module Runner
 */

var R = require('ramda');
var Promise = require('bluebird');

var Files = require('./files');

/**
 * Require a {@link Client}.
 * @param {string} client - Client name
 * @returns {Client}
 */
function requireClient(client) {
  return require('./clients/' + client);
}

/**
 * Connect a {@link Client} with a disconnect disposer.
 * @param {Client} Client
 * @param {Object} configuration - Client configuration
 * @returns {Disposer.<Client~Connection>}
 */
function useConnection(Client, configuration) {
  return Client.connect(configuration).disposer(Client.disconnect);
}

/**
 * Read migration journal. See {@link Client.readJournal}. Curried.
 * @alias module:Runner.readJournal
 * @param {string} client - Client name
 * @param {Object} configuration - Client configuration
 * @param {string} journalTable - Journal table name
 * @returns {Promise.<Client.JournalEntry[]>}
 */
function readJournal(client, configuration, journalTable) {
  var Client = requireClient(client);
  return Promise.using(useConnection(Client, configuration), function(db) {
    return Client.ensureJournal(db, journalTable)
      .then(R.partial(Client.readJournal, db, journalTable));
  });
}

module.exports = {
  readJournal: R.curry(readJournal)
};
