declare module 'minimist' {
  interface ArgV {
    [s: string]: string | boolean | number | string[];
    _: string[];
  }

  interface Options {
    string?: string | string[];
    boolean?: boolean | string | string[];
    alias?: { [s: string]: string | string[] };
    default?: { [s: string]: any };
    stopEarly?: boolean;
    '--'?: boolean;
    unknown?: (arg: string) => boolean;
  }

  function parseArgs(args: string[], opts: Options): ArgV;

  export = parseArgs;
}
