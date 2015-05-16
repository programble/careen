'use strict';

import { Config, ARGS_DOC } from '../config/index';

export default function help(_: Config): void {
  console.log(ARGS_DOC);
}
