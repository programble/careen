# Careen

[![Build Status](https://img.shields.io/travis/programble/careen/typescript.svg)](https://travis-ci.org/programble/careen)
[![Coverage Status](https://img.shields.io/coveralls/programble/careen.svg?style=flat)](https://coveralls.io/r/programble/careen?branch=master)

SQL schema migration. Nothing more. Nothing less.

## Feature Overview

- Applies raw SQL file migrations.
- Tracks both migration apply and revert operations in a journal table.
- Supports SQLite3 and PostgreSQL.

## Install

```sh
npm install careen

npm install sqlite
# or
npm install pg
```

## Configuration

Careen reads configuration from either `careen.js` or `careen.json` in the
directory it is run from. All options can be specified in JSON except the
migration ID generation function.

### Client

- `client`:
  - `name`: Name of the database client to use.
  - `config`: Connection configuration to pass to the database client.
  - `journalTable`: Name of the table to write migration journal to. Default
    `schema_journal`.

#### SQLite3 Example

```json
{
  "client": {
    "name": "sqlite3",
    "config": {
      "filename": "database.sqlite"
    },
    "journalTable": "schema_journal"
  }
}
```

#### PostgreSQL Example

```json
{
  "client": {
    "name": "postgresql",
    "config": {
      "url": "postgres://localhost:5432/database"
    },
    "journalTable": "schema_journal"
  }
}
```

Alternatively, see [node-postgres][pg-config] for all configuration options.

[pg-config]: https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client

### Files

- `files`:
  - `directory`: Directory containing migration SQL files. Default
    `migrations`.

```json
{
  "files": {
    "directory": "migrations"
  }
}
```

## Commands

### Create

```
careen -C my-first-migration
```

Create a new migration. An ID based on the current time will be prepended
to the migration name, and the appropriate extension will be appended.

Careen supports two types of migration files which can be used in unison. The
default type is "combined". These migration files contain both the up and down
SQL for a migration in a single file. The two sections are separated by a line
of three or more hyphens, `---`, a valid comment line in SQL. For example:

```sql
CREATE TABLE people (first_name TEXT NOT NULL, last_name TEXT NOT NULL);
---
DROP TABLE people;
```

The other supported type is "split" migration files, where the up and down SQL
are each in separate files ending in `.up.sql` and `.down.sql`, respectively.

To create split migration files, pass the `--split` or `-s` option.

Migrations are created by copying template files, which can be specified with
the `--template`, `--up-template`, `--down-template` options.

### Apply

```
careen -A
```

Apply migrations. The default behaviour is to apply all pending migrations
(migrations that have never been applied or have been reverted) in a single
transaction.

Migrations can be applied using different transaction methods:

- `--all` or `-a`: Apply all migrations in a single transaction (all or none).
- `--each` or `-e`: Apply each migration in a transaction (as many as possible).
- `--dry` or `-d`: Always `ROLLBACK` the migration transaction.

The migrations to apply can be specified in several ways:

- `--pending` or `-p`: Apply all pending migrations.
- `--id` or `-i`: Apply a single migration by ID.
- `--to` or `-t`: Apply migrations up to and including an ID.
- `--number` or `-n`: Apply a number of pending migrations.

### Revert

```
careen -R
```

Revert migrations. The default behavior is to revert the most recently applied
migration in a single transaction.

Method options are the same for revert as for apply.

The migrations to revert can be specified in several ways:

- `--number` or `-n`: Revert a number of recently applied migrations.
- `--id` or `-i`: Revert a migration by ID.
- `--to` ot `-t`: Revert applied migrations up to and excluding an ID.

### Status

```
careen -S
# or
careen
```

Read migration files and schema journal to determine the status of each
migration. The possible migration states are `pending`, `applied`, `reverted`
and `missing`.

To show the status of only a single migration, pass the `--id` or `-i` option.

### Journal

```
careen -J
```

Read the schema journal for apply and revert operations.

To show only journal entries for a single migration, pass the `--id` or `-i`
option.

### Migrations

```
careen -M
```

List all available migrations.

To list the paths of each migration's files, pass the `--long` or `-l` option.

To list a single migration, pass the `--id` or `-i` option.

---

> It's because of our plans, man<br>
> All our beautiful, ridiculous plans<br>
> Let's launch them like careening jet planes<br>
> Let's crash all of our planes into the river<br>
> Let's build strange and radiant machines<br>
> At this Jericho, waiting to fall<br>

## License

Copyright © 2015, Curtis McEnroe <curtis@cmcenroe.me>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
