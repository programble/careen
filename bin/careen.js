#!/usr/bin/env node
'use strict';

var R = require('ramda');
var Promise = require('bluebird');

var nomnom = require('nomnom');

var packageJSON = require('../package');

var parser = nomnom()
  .script('careen')
  .option('config', {
    abbr: 'c',
    default: 'careen.js',
    help: 'Configuration JavaScript or JSON file',
    metavar: 'FILE'
  })
  .option('version', {
    flag: true,
    help: 'Print version and exit',
    callback: function() {
      console.log(R.join(' ', [ packageJSON.name, packageJSON.version ]));
      process.exit();
    }
  });

parser.command('status')
  .help('Show pending migration status');

parser.command('list')
  .help('List all migrations');

parser.command('history')
  .help('Show migration history');

parser.command('sync')
  .help('Apply migrations')
  .option('latest', {
    abbr: 'l',
    flag: true,
    help: 'Apply all pending migrations'
  })
  .option('timestamp', {
    abbr: 't',
    help: 'Apply up or down migrations until TIMESTAMP is the last migration applied',
    metavar: 'TIMESTAMP'
  })

parser.command('rollback')
  .help('Roll back last operation');

parser.nocommand();

var opts = parser.parse();

console.log(opts);
