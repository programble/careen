declare module 'mock-fs' {
  import fs = require('fs');

  function mock(config?: mock.Config): void;

  module mock {
    class File {}
    class Directory {}
    class Symlink {}

    interface Config {
      [path: string]: string | Buffer | File | Directory | Symlink | Config;
    }

    interface Properties {
      mode?: number;
      uid?: number;
      gid?: number;
      atime?: Date;
      ctime?: Date;
      mtime?: Date;
      birthtime?: Date;
    }

    interface FileProperties extends Properties {
      content: string | Buffer;
    }

    interface DirectoryProperties extends Properties {
      items: Config;
    }

    interface SymlinkProperties extends Properties {
      path: string;
    }

    function file(properties: FileProperties): File;
    function directory(properties: DirectoryProperties): Directory;
    function symlink(properties: SymlinkProperties): Symlink;

    function restore(): void;

    function fs(config?: Config): typeof fs;
  }

  export = mock;
}
