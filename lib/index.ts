import client = require('./client/index');
import Dummy = require('./client/dummy');
import SQLite3 = require('./client/sqlite3');
import PostgreSQL = require('./client/postgresql');

var dummyClient: client.Client = Dummy;
var sqliteClient: client.Client = SQLite3;
var pgClient: client.Client = PostgreSQL;
