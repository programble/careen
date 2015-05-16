'use strict';

import util = require('util');

import R = require('ramda');

import StandardError = require('../standard-error');

export class ConfigError extends StandardError {
  key: string;
  expected: string;
  actual: string;
}

export class ConfigTypeError extends ConfigError {
  constructor(key: string, expected: string, actual: string) {
    this.key = key;
    this.expected = expected;
    this.actual = actual;
    super(`Expected ${key} to have type ${expected}, got ${actual}`);
  }

  static assert(key: string, expected: string, value: any): void {
    let actual = typeof value;
    if (actual !== expected) throw new ConfigTypeError(key, expected, actual);
  }
}

function enumStrings(enumObject: any) {
  return R.filter(k => isNaN(parseInt(k)), R.keys(enumObject));
}

export class ConfigEnumError extends ConfigError {
  constructor(key: string, enumObject: any, actual: string) {
    this.key = key;
    this.expected = enumStrings(enumObject).join(', ');
    this.actual = actual;
    super(`Expected ${key} to be one of ${this.expected}; got ${actual}`);
  }
}

export class ConfigOptionError extends ConfigError {
  constructor(public option: string) {
    super(`Unrecognized command line option: ${option}`);
  }
}
