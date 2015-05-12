'use strict';

import R = require('ramda');
import minimist = require('minimist');

import DEFAULTS = require('./defaults');
import {loadObject, loadFile} from './load';

export const ARGS_DOC =
`General:
  -c, --config=careen.js         Load configuration from file

  --client=dummy                 Use dummy database client (default)
  --client=sqlite3               Use SQLite3 database client
  --client=postgresql            Use PostgreSQL database client

  --client-config={}             Database client configuration
  --journal-table=schema_journal Migration journal table name

  --directory=migrations         Migration file directory

Commands:
  -S, --status                   List migration status (default)
  -M, --migrations               List migrations
  -J, --journal                  List journal entries
  -C, --create                   Create migration files
  -A, --apply                    Apply migrations
  -R, --revert                   Revert migrations

Status:
  -i, --id=                      Migration ID to show status for

Migrations:
  -l, --long                     Show migration file paths
  -i, --id=                      Migration ID to show

Journal:
  -i, --id=                      Migration ID to show journal for

Create:
  -u, --combined                 Create combined migration file (default)
  -s, --split                    Create split migration files
  --template=                    Combined template file
  --up-template=                 Up template file
  --down-template=               Down template file

Apply, Revert:
  -m, --method=all               Run all migrations in a transaction (default)
      --method=each              Run each migration in a transaction
      --method=dry               Always rollback transaction

  -a, --all                      Run all pending migrations (Apply default)
  -i, --id=                      Run migration by ID
  -t, --to=                      Run migrations until ID
  -n, --number=1                 Run a number of migrations (Revert default)

Other:
  -h, --help                     Show command line options
  --version                      Show version
`;

// TypeScript won't assign the alias literal to
// { [s: string]: string | string[] } without explicit typing.
type Options = {
  string: string[]; boolean: string[]; alias: { [s: string]: string };
};
const OPTIONS: Options = {
  string: [
    'config','client', 'client-config', 'journal-table', 'directory', 'id',
    'template', 'up-template', 'down-template', 'method', 'to'
  ],
  boolean: [
    'status', 'migrations', 'journal', 'create', 'apply', 'revert', 'long',
    'combined', 'split', 'all', 'help', 'version'
  ],
  alias: {
    'config': 'c', 'status': 'S', 'migrations': 'M', 'journal': 'J',
    'create': 'C', 'apply': 'A', 'revert': 'R', 'id': 'i', 'long': 'l',
    'combined': 'u', 'split': 's', 'method': 'm', 'all': 'a', 'to': 't',
    'number': 'n', 'help': 'h'
  }
};

export function loadArgs(args: string[], defaults = DEFAULTS) {
  let config = R.clone(defaults);

  let argv = minimist(args, OPTIONS);
  if (argv['config']) {
    let file = argv['config'];
    if (typeof file === 'string') config = loadFile(file, config);
  }

  let object: any = {};

  object.client = {};
  if (argv['client']) object.client.name = argv['client'];
  if (argv['client-config']) {
    let clientConfig = argv['client-config'];
    if (typeof clientConfig === 'string') {
      object.client.config = JSON.parse(clientConfig);
    } else {
      object.client.config = clientConfig;
    }
  }
  if (argv['journal-table']) object.client.journalTable = argv['journal-table'];

  if (argv['directory']) object.files = {directory: argv['directory']};

  if (argv['status']) object.command = 'status';
  if (argv['migrations']) object.command = 'migrations';
  if (argv['journal']) object.command = 'journal';
  if (argv['create']) object.command = 'create';
  if (argv['apply']) object.command = 'apply';
  if (argv['revert']) object.command = 'revert';
  if (argv['help']) object.command = 'help';
  if (argv['version']) object.command = 'version';
  let command: any = {};
  object.commands = {[object.command]: command};

  if (argv['id']) command.id = argv['id'];

  if (argv['long']) command.long = true;

  if (argv['combined']) command.split = false;
  if (argv['split']) command.split = true;

  command.templatePaths = {};
  if (argv['template']) command.templatePaths.combined = argv['template'];
  if (argv['up-template']) command.templatePaths.up = argv['up-template'];
  if (argv['down-template']) command.templatePaths.down = argv['down-template'];

  if (argv['method']) command.method = argv['method'];
  if (argv['all']) command.all = true;
  if (argv['to']) command.to = argv['to'];
  if (argv['number']) command.number = argv['number'];

  if (argv['_'].length) command.name = argv['_'].join('-');

  return loadObject(object, config);
}
