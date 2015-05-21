#!/usr/bin/env node
'use strict';

// Invoke compiled TypeScript file which cannot start with shebang.
require('./_careen').default(process.argv);
