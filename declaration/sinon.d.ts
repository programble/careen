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

  interface Stub extends Spy {
    withArgs(...args: any[]): Stub;

    onCall(n: number): Stub;
    onFirstCall(): Stub;
    onSecondCall(): Stub;
    onThirdCall(): Stub;

    returns(obj: any): Stub;
    returnsArg(index: number): Stub;
    returnsThis(): Stub;

    throws(): Stub;
    throws(name: string): Stub;
    throws(obj: Object): Stub;

    callsArg(index: number): Stub;
    callsArgOn(index: number, context: any): Stub;
    callsArgWith(index: number, ...args: any[]): Stub;
    callsArgOnWith(index: number, context: any, ...args: any[]): Stub;

    yields(...args: any[]): Stub;
    yieldsOn(context: any, ...args: any[]): Stub;
    yieldsTo(property: string, ...args: any[]): Stub;
    yieldsToOn(property: string, context: any, ...args: any[]): Stub;

    yield(...args: any[]): Stub;
    yieldTo(callback: string, ...args: any[]): Stub;

    callArg(argNum: number): Stub;
    callArgWith(argNum: number, ...args: any[]): Stub;

    callsArgAsync(index: number): Stub;
    callsArgOnAsync(index: number, context: any): Stub;
    callsArgWithAsync(index: number, ...args: any[]): Stub;
    callsArgOnWithAsync(index: number, context: any, ...args: any[]): Stub;

    yieldsAsync(...args: any[]): Stub;
    yieldsOnAsync(context: any, ...args: any[]): Stub;
    yieldsToAsync(property: string, ...args: any[]): Stub;
    yieldsToOnAsync(property: string, context: any, ...args: any[]): Stub;
  }

  function stub(): Stub;
  function stub(object: Object): Stub;
  function stub(object: Object, method: string, func?: Function): Stub;

  interface Mock {
    expects(method: string): Expectation;

    restore(): void;
    verify(): void;
  }

  interface Expectation extends Stub {
    atLeast(number: number): Expectation;
    atMost(number: number): Expectation;

    never(): Expectation;

    once(): Expectation;
    twice(): Expectation;
    thrice(): Expectation;

    exactly(number: number): Expectation;

    withArgs(...args: any[]): Expectation;
    withExactArgs(...args: any[]): Expectation;

    on(obj: any): Expectation;

    verify(): void;
  }

  function mock(obj: Object): Mock;
  function mock(): Expectation;

  module expectation {
    function create(methodName: string): Expectation;
  }
}
