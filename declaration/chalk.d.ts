declare module 'chalk' {
  export interface Chain {
    (...strings: string[]): string;

    reset: Chain;
    bold: Chain;
    italic: Chain;
    underline: Chain;
    inverse: Chain;
    strikethrough: Chain;

    black: Chain;
    red: Chain;
    green: Chain;
    yellow: Chain;
    blue: Chain;
    magenta: Chain;
    cyan: Chain;
    white: Chain;
    gray: Chain;

    bgBlack: Chain;
    bgRed: Chain;
    bgGreen: Chain;
    bgYellow: Chain;
    bgBlue: Chain;
    bgMagenta: Chain;
    bgCyan: Chain;
    bgWhite: Chain;
  }

  export var enabled: boolean;
  export var supportsColor: boolean;

  export interface Style {
    open: string;
    close: string;
  }

  export var styles: {
    reset: Style;
    bold: Style;
    italic: Style;
    underline: Style;
    inverse: Style;
    strikethrough: Style;

    black: Style;
    red: Style;
    green: Style;
    yellow: Style;
    blue: Style;
    magenta: Style;
    cyan: Style;
    white: Style;
    gray: Style;

    bgBlack: Style;
    bgRed: Style;
    bgGreen: Style;
    bgYellow: Style;
    bgBlue: Style;
    bgMagenta: Style;
    bgCyan: Style;
    bgWhite: Style;
  };

  export function hasColor(string: string): boolean;
  export function stripColor(string: string): string;

  export var reset: Chain;
  export var bold: Chain;
  export var italic: Chain;
  export var underline: Chain;
  export var inverse: Chain;
  export var strikethrough: Chain;

  export var black: Chain;
  export var red: Chain;
  export var green: Chain;
  export var yellow: Chain;
  export var blue: Chain;
  export var magenta: Chain;
  export var cyan: Chain;
  export var white: Chain;
  export var gray: Chain;

  export var bgBlack: Chain;
  export var bgRed: Chain;
  export var bgGreen: Chain;
  export var bgYellow: Chain;
  export var bgBlue: Chain;
  export var bgMagenta: Chain;
  export var bgCyan: Chain;
  export var bgWhite: Chain;
}
