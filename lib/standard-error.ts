'use strict';

import util = require('util');

class StandardError implements Error {
  name: string;
  message: string;
  stack: string;

  constructor(message: string) {
    this.name = (<any> this.constructor).name;
    this.message = message;
    (<any> Error).captureStackTrace(this, this.constructor);
  }
}
util.inherits(StandardError, Error);

export = StandardError;
