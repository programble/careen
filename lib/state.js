'use strict';

/**
 * Migration state functions.
 * @module state
 */

var R = require('ramda');
var SuperError = require('super-error');

var Runner = require('./runner');

/**
 * Migration state strings.
 * @alias module:state.STATE
 * @enum {string}
 */
var STATE = {
  PENDING: 'pending',
  APPLIED: 'applied',
  REVERTED: 'reverted',
  MISSING: 'missing'
};

/**
 * Invalid journal entry operation error.
 * @alias module:state.InvalidJournalOperationError
 * @class
 * @param {string} operation - Invalid operation
 */
var InvalidJournalOperationError = SuperError.subclass(
  'InvalidJournalOperationError',
  function(operation) {
    this.message = 'Invalid journal entry operation: ' + operation;
  }
);

/**
 * Get migration states. Curried.
 * @alias module:state.getMigrationStates
 * @param {module:files.Migration[]} migrations - All migrations
 * @param {Client.JournalEntry[]} journalEntries - All journal entries
 * @returns {Object.<string, module:state.STATE>} Map of migration IDs to states
 * @throws {module:state.InvalidJournalOperationError}
 */
function getMigrationStates(migrations, journalEntries) {
  var initialStates = R.zipObj(
    R.pluck('id', migrations),
    R.times(R.always(STATE.PENDING), migrations.length)
  );
  return R.reduce(function(states, journalEntry) {
    if (!R.has(journalEntry.migrationID, states)) {
      return R.assoc(journalEntry.migrationID, STATE.MISSING, states);
    } else if (journalEntry.operation === Runner.OPERATION.APPLY) {
      return R.assoc(journalEntry.migrationID, STATE.APPLIED, states);
    } else if (journalEntry.operation === Runner.OPERATION.REVERT) {
      return R.assoc(journalEntry.migrationID, STATE.REVERTED, states);
    } else {
      throw new InvalidJournalOperationError(journalEntry.operation);
    }
  }, initialStates, journalEntries);
}

module.exports = {
  STATE: STATE,
  InvalidJournalOperationError: InvalidJournalOperationError,
  getMigrationStates: R.curry(getMigrationStates)
};
