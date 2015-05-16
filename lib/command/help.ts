'use strict';

import * as Promise from 'bluebird';

import { Config, ARGS_DOC } from '../config/index';

export default function help(_: Config) {
  return Promise.resolve(ARGS_DOC);
}
