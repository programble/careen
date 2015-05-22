declare module 'ramda' {
   function always<T>(val: T): (...args: any[]) => T;

   function any<T>(fn: (item: T) => boolean, list: T[]): boolean;
   function any<T>(fn: (item: T) => boolean): (list: T[]) => boolean;

   function assoc<T>(prop: string, val: any, obj: T): T;
   function assoc<T>(prop: string, val: any): (obj: T) => T;

   function clone<T>(value: T): T;

   function contains<T>(a: T, list: T[]): boolean;

   function filter<T>(fn: (item: T) => boolean, list: T[]): T[];
   function filter<T>(fn: (item: T) => boolean): (list: T[]) => T[];

   function find<T>(fn: (item: T) => boolean, list: T[]): T;
   function find<T>(fn: (item: T) => boolean): (list: T[]) => T;

   function forEach<T>(fn: (item: T) => void, list: T[]): T[];
   function forEach<T>(fn: (item: T) => void): (list: T[]) => T[];

   function groupBy<T>(fn: (item: T) => string, list: T[]): {[s: string]: T[]};
   function groupBy<T>(fn: (item: T) => string): (list: T[]) => {[s: string]: T[]};

   function has(prop: string, obj: {[s: string]: any}): boolean;
   function has(prop: string): (obj: {[s: string]: any}) => boolean;

   function identity<T>(x: T): T;

   function is(ctor: Function, val: any): boolean;
   function is(ctor: Function): (val: any) => boolean;

   function join(separator: string, xs: string[]): string;
   function join(separator: string): (xs: string[]) => string;

   function keys(obj: Object): string[];

   function last<T>(list: T[]): T;

   function match(rx: RegExp, str: string): RegExpMatchArray;
   function match(rx: RegExp): (str: string) => RegExpMatchArray;

   function map<T, U>(fn: (item: T) => U, list: T[]): U[];
   function map<T, U>(fn: (item: T) => U): (list: T[]) => U[];

   function mapObj<T, U>(fn: (item: T) => U, obj: {[s: string]: T}): {[s: string]: U};
   function mapObj<T, U>(fn: (item: T) => U): (obj: {[s: string]: T}) => {[s: string]: U};

   function nth<T>(index: number, list: T[]): T;
   function nth<T>(index: number): (list: T[]) => T;

   function partial<A, Z>(fn: (a: A) => Z, a: A): () => Z;
   function partial<A, B, Z>(fn: (a: A, b: B) => Z, a: A): (b: B) => Z;
   function partial<A, B, Z>(fn: (a: A, b: B) => Z, a: A, b: B): () => Z;
   function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A): (b: B, c: C) => Z;
   function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A, b: B): (c: C) => Z;
   function partial<A, B, C, Z>(fn: (a: A, b: B, c: C) => Z, a: A, b: B, c: C): () => Z;

   function prop<T>(name: string, obj: {[s: string]: T}): T;
   function prop<T>(name: string): (obj: {[s: string]: T}) => T;

   function props<T>(ps: string[], obj: {[s: string]: T}): T[];
   function props<T>(ps: string[]): (obj: {[s: string]: T}) => T[];

   function propEq<T>(name: string, val: T, obj: {[s: string]: T}): boolean;
   function propEq<T>(name: string, val: T): (obj: {[s: string]: T}) => boolean;
   function propEq<T>(index: number, val: T, list: T[]): boolean;
   function propEq<T>(index: number, val: T): (list: T[]) => boolean;

   function reduce<T, U>(fn: (acc: T, value: U) => T, acc: T, list: U[]): T;
   function reduce<T, U>(fn: (acc: T, value: U) => T, acc: T): (list: U[]) => T;
   function reduce<T, U>(fn: (acc: T, value: U) => T): (acc: T, list: U[]) => T;

   function reject<T>(fn: (item: T) => boolean, list: T[]): T[];
   function reject<T>(fn: (item: T) => boolean): (list: T[]) => T[];

   function reverse<T>(list: T[]): T[];

   function sortBy<T>(fn: (item: T) => string, list: T[]): T[];
   function sortBy<T>(fn: (item: T) => string): (list: T[]) => T[];

   function split(sep: string | RegExp, str: string): string[];
   function split(sep: string | RegExp): (str: string) => string[];

   function take<T>(n: number, list: T[]): T[];
   function take<T>(n: number): (list: T[]) => T[];

   function times<T>(fn: (i: number) => T, n: number): T[];
   function times<T>(fn: (i: number) => T): (n: number) => T[];

   function trim(str: string): string;

   function values<T>(obj: {[s: string]: T}): T[];

   function zipObj<T>(keys: string[], values: T[]): {[s: string]: T};
   function zipObj<T>(keys: string[]): (values: T[]) => {[s: string]: T};

   function F(): boolean;
   function T(): boolean;
}
