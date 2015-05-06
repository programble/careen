// Type definitions for sqlite3 2.2.3
// Project: https://github.com/mapbox/node-sqlite3
// Definitions by: Nick Malaguti <https://github.com/nmalaguti/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="node.d.ts" />
/// <reference path="bluebird.d.ts" />

declare module 'sqlite3' {
  import events = require('events');

  export var OPEN_READONLY: number;
  export var OPEN_READWRITE: number;
  export var OPEN_CREATE: number;

  export var cached: {
    Database(filename: string, callback?: (err: Error) => void): Database;
    Database(filename: string, mode?: number, callback?: (err: Error) => void): Database;
  };

  export interface RunResult {
    lastID: number;
    changes: number;
  }

  export class Statement {
    bind(callback?: (err: Error) => void): Statement;
    bind(...params: any[]): Statement;

    reset(callback?: (err: Error) => void): Statement;

    finalize(callback?: (err: Error) => void): Statement;

    run(callback?: (err: Error) => void): Statement;
    run(...params: any[]): Statement;

    get(callback?: (err: Error, row: any) => void): Statement;
    get(...params: any[]): Statement;

    all(callback?: (err: Error, rows: any[]) => void): Statement;
    all(...params: any[]): Statement;

    each(callback?: (err: Error, row: any) => void, complete?: (err: Error, count: number) => void): Statement;
    each(...params: any[]): Statement;
  }

  export class Database extends events.EventEmitter {
    constructor(filename: string, callback?: (err: Error) => void);
    constructor(filename: string, mode?: number, callback?: (err: Error) => void);

    close(callback?: (err: Error) => void): void;
    closeAsync(): Promise<void>;

    run(sql: string, callback?: (err: Error) => void): Database;
    run(sql: string, ...params: any[]): Database;
    runAsync(sql: string, ...params: any[]): Promise<void>;

    get(sql: string, callback?: (err: Error, row: any) => void): Database;
    get(sql: string, ...params: any[]): Database;
    getAsync(sql: string, ...params: any[]): Promise<any>;

    all(sql: string, callback?: (err: Error, rows: any[]) => void): Database;
    all(sql: string, ...params: any[]): Database;
    allAsync(sql: string, ...params: any[]): Promise<any[]>;

    each(sql: string, callback?: (err: Error, row: any) => void, complete?: (err: Error, count: number) => void): Database;
    each(sql: string, ...params: any[]): Database;

    exec(sql: string, callback?: (err: Error) => void): Database;
    execAsync(sql: string): Promise<void>;

    prepare(sql: string, callback?: (err: Error) => void): Statement;
    prepare(sql: string, ...params: any[]): Statement;

    serialize(callback?: () => void): void;
    parallelize(callback?: () => void): void;

    on(event: 'trace', listener: (sql: string) => void): Database;
    on(event: 'profile', listener: (sql: string, time: number) => void): Database;
    on(event: 'error', listener: (err: Error) => void): Database;
    on(event: 'open', listener: () => void): Database;
    on(event: 'close', listener: () => void): Database;
    on(event: string, listener: Function): Database;
  }

  function verbose(): void;
}
