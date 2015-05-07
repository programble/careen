declare module 'fs' {
  export function mkdirAsync(path: string, mode?: number|string): Promise<void>;

  export function readdirAsync(path: string): Promise<string[]>;

  export function readFileAsync(filename: string, encoding: string): Promise<string>;
  export function readFileAsync(filename: string, options: { encoding: string; flag?: string; }): Promise<string>;
  export function readFileAsync(filename: string, options?: { flag?: string; }): Promise<Buffer>;

  export function statAsync(path: string): Promise<Stats>;

  export function writeFileAsync(filename: string, data: any, options?: {encoding?: string; mode?: number|string; flag?: string;}): Promise<void>;
}
