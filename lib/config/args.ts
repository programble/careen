'use strict';

import * as R from 'ramda';
import minimist = require('minimist');

import DEFAULTS from './defaults';
import { loadObject, loadFile } from './load';
import { ConfigOptionError } from './errors';

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

Apply:
  -a, --all                      Apply all in one transaction (default)
  -e, --each                     Apply each in a transaction
  -d, --dry                      Always rollback transaction

  -p, --pending                  Apply all pending migrations (default)
  -i, --id=                      Apply migration by ID
  -t, --to=                      Apply migrations until ID
  -n, --number=                  Apply a number of pending migrations

Revert:
  -a, --all                      Revert all in one transaction (default)
  -e, --each                     Revert each in a transaction
  -d, --dry                      Always rollback transaction

  -n, --number=1                 Revert a number of applied migrations
  -i, --id=                      Revert migration by ID
  -t, --to=                      Revert migrations until ID

Other:
  -h, --help                     Show command line options
  --version                      Show version
`;

function unknownHandler(arg: string) {
  // Send non-options to argv._
  if (arg.indexOf('-') !== 0) return true;
  throw new ConfigOptionError(arg);
}

// TypeScript won't assign the alias literal to
// { [s: string]: string | string[] } without explicit typing.
type Options = {
  string: string[];
  boolean: string[];
  alias: { [s: string]: string };
  unknown: typeof unknownHandler;
};
const OPTIONS: Options = {
  string: [
    'config','client', 'client-config', 'journal-table', 'directory', 'id',
    'template', 'up-template', 'down-template', 'to'
  ],
  boolean: [
    'status', 'migrations', 'journal', 'create', 'apply', 'revert', 'long',
    'combined', 'split', 'all', 'each', 'dry', 'pending', 'help', 'version'
  ],
  alias: {
    'config': 'c', 'status': 'S', 'migrations': 'M', 'journal': 'J',
    'create': 'C', 'apply': 'A', 'revert': 'R', 'id': 'i', 'long': 'l',
    'combined': 'u', 'split': 's', 'all': 'a', 'each': 'e', 'dry': 'd',
    'pending': 'p', 'to': 't', 'number': 'n', 'help': 'h'
  },
  unknown: unknownHandler
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

  if (argv['all']) command.method = 'all';
  if (argv['each']) command.method = 'each';
  if (argv['dry']) command.method = 'dry';

  if (argv['pending']) command.pending = true;
  if (argv['to']) command.to = argv['to'];
  if (argv['number']) command.number = argv['number'];

  if (argv['_'].length) command.name = argv['_'].join('-');

  return loadObject(object, config);
}
