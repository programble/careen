declare module 'ramda' {
  export function assoc<T>(prop: string, val: any, obj: T): T;

  export function clone<T>(value: T): T;
}
