'use strict';

import { inherits } from 'util';

export default class StandardError implements Error {
  name: string;
  message: string;
  stack: string;

  constructor(message: string) {
    this.name = (<any> this.constructor).name;
    this.message = message;
    (<any> Error).captureStackTrace(this, this.constructor);
  }
}
inherits(StandardError, Error);
