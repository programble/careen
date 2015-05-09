// Only exists so that the clients are checked against the Client interface at
// compile time.

import client = require('./index');

import dummyClient = require('./dummy');
import sqlite3Client = require('./sqlite3');
import postgresqlClient = require('./postgresql');

export var dummy: client.Client = dummyClient;
export var sqlite3: client.Client = sqlite3Client;
export var postgresql: client.Client = postgresqlClient;
