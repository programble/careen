# Careen

No-frills SQL schema migration tool.

## Feature Goals

- Runs SQL files without any excess abstraction
- Supports major SQL databases: PostgreSQL, MySQL, SQLite3
- Configurable with sane defaults
- Keeps detailed information about migration application
- Can be used as a library

## Code Goals

- Uses promises, via [Bluebird](https://github.com/petkaantonov/bluebird)
- Functional programming, aided by [Ramda](https://github.com/ramda/ramda)
- Abstracted SQL database support
- Minimal dependencies

> It's because of our plans, man<br>
> All our beautiful, ridiculous plans<br>
> Let's launch them like careening jet planes<br>
> Let's crash all of our planes into the river<br>
> Let's build strange and radiant machines<br>
> At this Jericho, waiting to fall<br>

## License

Copyright © 2015, Curtis McEnroe <curtis@cmcenroe.me>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
