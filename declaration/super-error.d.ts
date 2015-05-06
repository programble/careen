declare module 'super-error' {
  class SuperError implements Error {
    name: string;
    message: string;
    stack: string;

    cause: Error;
    rootCause: Error;
    ownStack: string;

    constructor(...params: any[]);

    static subclass(exports: any, name: string, constructor: Function): typeof SuperError;
    static subclass(name: string, constructor: Function): typeof SuperError;
    static subclass(name: string): typeof SuperError;

    causedBy(cause: Error): SuperError;
  }
  export = SuperError;
}
