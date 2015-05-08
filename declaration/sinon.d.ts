declare module 'sinon' {
  interface Spy {
    withArgs(...args: any[]): Spy;

    callCount: number;

    called: boolean;
    calledOnce: boolean;
    calledTwice: boolean;
    calledThrice: boolean;

    firstCall: SpyCall;
    secondCall: SpyCall;
    thirdCall: SpyCall;
    lastCall: SpyCall;

    calledBefore(anotherSpy: Spy): boolean;
    calledAfter(anotherSpy: Spy): boolean;

    calledOn(obj: any): boolean;
    alwaysCalledOn(obj: any): boolean;

    calledWith(...args: any[]): boolean;
    alwaysCalledWith(...args: any[]): boolean;
    calledWithExactly(...args: any[]): boolean;
    alwaysCalledWithExactly(...args: any[]): boolean;
    calledWithMatch(...args: any[]): boolean;
    alwaysCalledWithMatch(...args: any[]): boolean;

    calledWithNew(): boolean;

    neverCalledWith(...args: any[]): boolean;
    neverCalledWithMatch(...args: any[]): boolean;

    threw(): boolean;
    threw(name: string): boolean;
    threw(obj: any): boolean;
    alwaysThrew(): boolean;
    alwaysThrew(name: string): boolean;
    alwaysThrew(obj: any): boolean;

    returned(obj: any): boolean;
    alwaysReturned(obj: any): boolean;

    getCall(n: number): SpyCall;

    thisValues: any[];
    args: any[][];
    exceptions: any[];
    returnValues: any[];

    reset(): void;
    restore(): void;

    printf(format: string, ...args: any[]): string;
  }

  interface SpyCall {
    calledOn(obj: any): boolean;

    calledWith(...args: any[]): boolean;
    calledWithExactly(...args: any[]): boolean;
    calledWithMatch(...args: any[]): boolean;
    notCalledWith(...args: any[]): boolean;
    notCalledWithMatch(...args: any[]): boolean;

    threw(): boolean;
    threw(name: string): boolean;
    threw(obj: any): boolean;

    thisValue: any;
    args: any[];
    exception: any;
    returnValue: any;
  }

  function spy(): Spy;
  function spy(myFunc: Function): Spy;
  function spy(object: Object, method: string): Spy;
}
