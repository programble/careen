declare module 'ramda' {
  export function assoc<T>(prop: string, val: any, obj: T): T;
  export function assoc<T>(prop: string, val: any): (obj: T) => T;

  export function clone<T>(value: T): T;

  export function find<T>(fn: (item: T) => boolean, list: T[]): T;
  export function find<T>(fn: (item: T) => boolean): (list: T[]) => T;

  export function groupBy<T>(fn: (item: T) => string, list: T[]): {[s: string]: T[]};
  export function groupBy<T>(fn: (item: T) => string): (list: T[]) => {[s: string]: T[]};

  export function identity<T>(x: T): T;

  export function match(rx: RegExp, str: string): RegExpMatchArray;
  export function match(rx: RegExp): (str: string) => RegExpMatchArray;

  export function map<T, U>(fn: (item: T) => U, list: T[]): U[];
  export function map<T, U>(fn: (item: T) => U): (list: T[]) => U[];

  export function mapObj<T, U>(fn: (item: T) => U, obj: {[s: string]: T}): {[s: string]: U};
  export function mapObj<T, U>(fn: (item: T) => U): (obj: {[s: string]: T}) => {[s: string]: U};

  export function nth<T>(index: number, list: T[]): T;
  export function nth<T>(index: number): (list: T[]) => T;

  export function partial<A, Z>(fn: (a: A) => Z, a: A): () => Z;
  export function partial<A, B, Z>(fn: (a: A, b: B) => Z, a: A): (b: B) => Z;
  export function partial<A, B, Z>(fn: (a: A, b: B) => Z, a: A, b: B): () => Z;
  export function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A): (b: B, c: C) => Z;
  export function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A, b: B): (c: C) => Z;
  export function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A, b: B, c: C): () => Z;

  export function prop<T>(name: string, obj: {[s: string]: T}): T;
  export function prop<T>(name: string): (obj: {[s: string]: T}) => T;

  export function propEq<T>(name: string, val: T, obj: {[s: string]: T}): boolean;
  export function propEq<T>(name: string, val: T): (obj: {[s: string]: T}) => boolean;
  export function propEq<T>(index: number, val: T, list: T[]): boolean;
  export function propEq<T>(index: number, val: T): (list: T[]) => boolean;

  export function sortBy<T>(fn: (item: T) => string, list: T[]): T[];
  export function sortBy<T>(fn: (item: T) => string): (list: T[]) => T[];

  export function values<T>(obj: {[s: string]: T}): T[];

  export function F(): boolean;
  export function T(): boolean;
}
