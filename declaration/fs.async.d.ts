declare module 'fs' {
  export function mkdirAsync(path: string, mode?: number|string): Promise<void>;

  export function readdirAsync(path: string): Promise<string[]>;

  export function writeFileAsync(filename: string, data: any, options?: {encoding?: string; mode?: number|string; flag?: string;}): Promise<void>;
}
