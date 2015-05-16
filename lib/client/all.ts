'use strict';

// Only exists so that the clients are checked against the Client interface at
// compile time.

import { Client } from './index';

import * as dummyClient from './dummy';
import * as sqlite3Client from './sqlite3';
import * as postgresqlClient from './postgresql';

export const dummy: Client = dummyClient;
export const sqlite3: Client = sqlite3Client;
export const postgresql: Client = postgresqlClient;
