declare module 'minimist' {
  function minimist(args: string[], opts: minimist.Options): minimist.ArgV;

  module minimist {
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
  }

  export = minimist;
}
