'use strict';

import * as Promise from 'bluebird';

import { Config } from '../config/index';

export default function version(_: Config) {
  let packageJSON = require('../../package.json');
  return Promise.resolve<string>(packageJSON.version);
}
