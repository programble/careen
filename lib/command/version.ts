'use strict';

import { Config } from '../config/index';

export default function version(_: Config): void {
  let packageJSON = require('../../package.json');
  console.log(packageJSON.version);
}
