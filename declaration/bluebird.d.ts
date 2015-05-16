declare class Promise<T> implements Promise.Thenable<T> {
  constructor(
    callback: (
      resolve: (value: Promise.Thenable<T>) => void,
      reject: (reason: any) => void
    ) => void
  );
  constructor(
    callback: (
      resolve: (value: T) => void,
      reject: (reason: any) => void
    ) => void
  );

  static resolve(): Promise<void>;
  static resolve<U>(value: Promise.Thenable<U>): Promise<U>;
  static resolve<U>(value: U): Promise<U>;

  static reject(reason: any): Promise<void>;

  static join<U, V, W>(
    a: Promise.Thenable<V>,
    b: Promise.Thenable<W>,
    handler: (a: V, b: W) => Promise.Thenable<U>
  ): Promise<U>;
  static join<U, V, W>(
    a: V,
    b: Promise.Thenable<W>,
    handler: (a: V, b: W) => Promise.Thenable<U>
  ): Promise<U>;
  static join<U, V, W>(
    a: Promise.Thenable<V>,
    b: W,
    handler: (a: V, b: W) => Promise.Thenable<U>
  ): Promise<U>;
  static join<U, V, W>(
    a: Promise.Thenable<V>,
    b: Promise.Thenable<W>,
    handler: (a: V, b: W) => U
  ): Promise<U>;
  static join<U, V, W>(
    a: V,
    b: W,
    handler: (a: V, b: W) => Promise.Thenable<U>
  ): Promise<U>;
  static join<U, V, W>(
    a: V,
    b: Promise.Thenable<W>,
    handler: (a: V, b: W) => U
  ): Promise<U>;
  static join<U, V, W>(
    a: Promise.Thenable<V>,
    b: W,
    handler: (a: V, b: W) => U
  ): Promise<U>;
  static join<U, V, W>(
    a: V,
    b: W,
    handler: (a: V, b: W) => U
  ): Promise<U>;

  static join<U, V, W, X>(
    a: Promise.Thenable<V>,
    b: Promise.Thenable<W>,
    c: Promise.Thenable<X>,
    handler: (a: V, b: W, c: X) => Promise.Thenable<U>
  ): Promise<U>;

  static promisify<U>(
    nodeFunction: (callback: (err: any, result: U) => void) => void,
    receiver?: any
  ): () => Promise<U>;
  static promisify<U, V>(
    nodeFunction: (a: V, callback: (err: any, result: U) => void) => void,
    receiver?: any
  ): (a: V) => Promise<U>;

  static promisifyAll(target: Object, options?: Promise.PromisifyOptions): void;

  static map<U, V>(
    values: Promise.Thenable<Promise.Thenable<V>[]>,
    mapper: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: Promise.Thenable<Promise.Thenable<V>[]>,
    mapper: (item: V, index: number, arrayLength: number) => U,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: Promise.Thenable<V[]>,
    mapper: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: Promise.Thenable<V[]>,
    mapper: (item: V, index: number, arrayLength: number) => U,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: Promise.Thenable<V>[],
    mapper: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: Promise.Thenable<V>[],
    mapper: (item: V, index: number, arrayLength: number) => U,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: V[],
    mapper: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  static map<U, V>(
    values: V[],
    mapper: (item: V, index: number, arrayLength: number) => U,
    options?: Promise.MapOptions
  ): Promise<U[]>;

  then<U>(
    fulfilledHandler: (value: T) => Promise.Thenable<U>,
    rejectedHandler: (reason: any) => Promise.Thenable<U>
  ): Promise<U>;
  then<U>(
    fulfilledHandler: (value: T) => Promise.Thenable<U>,
    rejectedHandler?: (reason: any) => U
  ): Promise<U>;
  then<U>(
    fulfilledHandler: (value: T) => U,
    rejectedHandler: (reason: any) => Promise.Thenable<U>
  ): Promise<U>;
  then<U>(
    fulfilledHandler?: (value: T) => U,
    rejectedHandler?: (reason: any) => U
  ): Promise<U>;

  catch<U>(handler: (reason: any) => Promise.Thenable<U>): Promise<U>;
  catch<U>(handler: (reason: any) => U): Promise<U>;
  catch<U>(
    predicate: (reason: any) => boolean,
    handler: (reason: any) => Promise.Thenable<U>
  ): Promise<U>;
  catch<U>(
    predicate: (reason: any) => boolean,
    handler: (reason: any) => U
  ): Promise<U>;
  catch<U>(
    errorClass: Function,
    handler: (reason: any) => Promise.Thenable<U>
  ): Promise<U>;
  catch<U>(
    errorClass: Function,
    handler: (reason: any) => U
  ): Promise<U>;

  finally<U>(handler: () => Promise.Thenable<U>): Promise<T>;
  finally<U>(handler: () => U): Promise<T>;

  map<U, V>(
    mapper: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>,
    options?: Promise.MapOptions
  ): Promise<U[]>;
  map<U, V>(
    mapper: (item: V, index: number, arrayLength: number) => U,
    options?: Promise.MapOptions
  ): Promise<U[]>;

  filter<V>(
    filterer: (item: V, index: number, arrayLength: number) => Promise.Thenable<boolean>,
    options?: Promise.MapOptions
  ): Promise<T>;
  filter<V>(
    filterer: (item: V, index: number, arrayLength: number) => boolean,
    options?: Promise.MapOptions
  ): Promise<T>;

  each<U, V>(
    iterator: (item: V, index: number, arrayLength: number) => Promise.Thenable<U>
  ): Promise<T>;
  each<U, V>(
    iterator: (item: V, index: number, arrayLength: number) => U
  ): Promise<T>;

  tap<U>(handler: (value: T) => Promise.Thenable<U>): Promise<T>;
  tap<U>(handler: (value: T) => U): Promise<T>;

  return<U>(value: Promise.Thenable<U>): Promise<U>;
  return<U>(value: U): Promise<U>;

  throw(reason: any): Promise<void>;

  disposer<U>(disposer: (value: T) => Promise.Thenable<U>): Promise.Disposer<T>;
  disposer<U>(disposer: (value: T) => U): Promise.Disposer<T>;

  static using<T, U>(
    promise: Promise.Disposer<T>,
    handler: (value: T) => Promise.Thenable<U>
  ): Promise<U>;
  static using<T, U>(
    promise: Promise.Disposer<T>,
    handler: (value: T) => U
  ): Promise<U>;
}

declare module Promise {
  export interface Thenable<T> {
    then<U>(
      fulfilledHandler: (value: T) => Thenable<U>,
      rejectedHandler: (error: any) => Thenable<U>
    ): Thenable<U>;
    then<U>(
      fulfilledHandler: (value: T) => Thenable<U>,
      rejectedHandler?: (error: any) => U
    ): Thenable<U>;
    then<U>(
      fulfilledHandler: (value: T) => U,
      rejectedHandler: (error: any) => Thenable<U>
    ): Thenable<U>;
    then<U>(
      fulfilledHandler?: (value: T) => U,
      rejectedHandler?: (error: any) => U
    ): Thenable<U>;
  }

  export interface PromisifyOptions {
    suffix?: string;
    filter?: (
      name: string,
      func: Function,
      target: Object,
      passesDefaultFilter: boolean
    ) => boolean;
    promisifier?: (
      originalMethod: Function,
      defaultPromisifer: (originalMethod: Function) => (...args: any[]) => Promise<any>
    ) => (...args: any[]) => Promise<any>;
  }

  export interface MapOptions {
    concurrency?: number
  }

  export class Disposer<T> extends Promise<T> {
  }
}

declare module 'bluebird' {
  export = Promise;
}
