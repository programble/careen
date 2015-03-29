declare module 'hemp' {
  interface Hemp {
    (): string;
    (...fibres: string[]): Hemp;
    toString(): string;
  }

  function hemp(separator?: string, prefix?: string, suffix?: string): Hemp;
  export = hemp;
}
