'use strict';

import * as assert from 'assert';

import * as config from '../../lib/config/index';

describe('Config loadObject', function() {
  describe('with empty object', function() {
    it('returns defaults', () =>
      assert.deepEqual(config.loadObject({}), config.DEFAULTS)
    );
  });

  describe('with explicit defaults', function() {
    let explicitDefaults: config.Config;

    before(() =>
      explicitDefaults = config.loadObject({client: {name: 'test'}})
    );

    it('inherits defaults', function() {
      let testConfig = config.loadObject({}, explicitDefaults);
      assert.equal(testConfig.client.name, 'test');
    });
  });

  describe('client', function() {
    describe('with non-object', function() {
      it('throws ConfigTypeError', () =>
        assert.throws(
          () => config.loadObject({client: 'string'}), 
          config.ConfigTypeError
        )
      );
    });

    describe('name', function() {
      it('sets name', function() {
        let testConfig = config.loadObject({client: {name: 'test'}});
        assert.equal(testConfig.client.name, 'test');
      });

      describe('with non-string', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({client: {name: 1}}),
            config.ConfigTypeError
          )
        )
      });
    });

    describe('config', function() {
      it('sets config', function() {
        let testConfig = config.loadObject({client: {config: {test: 1}}});
        assert.deepEqual(testConfig.client.config, {test: 1});
      });

      describe('with non-object', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({client: {config: 'string'}}),
            config.ConfigTypeError
          )
        );
      });
    });

    describe('journalTable', function() {
      it('sets journalTable', function() {
        let testConfig = config.loadObject({client: {journalTable: 'test'}});
        assert.equal(testConfig.client.journalTable, 'test');
      });

      describe('with non-string', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({client: {journalTable: 1}}),
            config.ConfigTypeError
          )
        );
      });
    });
  });

  describe('files', function() {
    describe('with non-object', function() {
      it('throws ConfigTypeError', () =>
        assert.throws(
          () => config.loadObject({files: 'string'}),
          config.ConfigTypeError
        )
      );
    });

    describe('directory', function() {
      it('sets directory', function() {
        let testConfig = config.loadObject({files: {directory: 'test'}});
        assert.equal(testConfig.files.directory, 'test');
      });

      describe('with non-string', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({files: {directory: 1}}),
            config.ConfigTypeError
          )
        );
      });
    });
  });

  describe('command', function() {
    it('sets command', function() {
      let testConfig = config.loadObject({command: 'apply'});
      assert.equal(testConfig.command, config.Command.apply);
    });

    describe('with non-enum', function() {
      it('throws ConfigEnumError', () =>
        assert.throws(
          () => config.loadObject({command: 'explode'}),
          config.ConfigEnumError
        )
      );
    });

    describe('with non-string', function() {
      it('throws ConfigTypeError', () =>
        assert.throws(
          () => config.loadObject({command: 1}),
          config.ConfigTypeError
        )
      );
    });
  });

  describe('commands', function() {
    describe('with non-object', function() {
      it('throws ConfigTypError', () =>
        assert.throws(
          () => config.loadObject({commands: 'string'}),
          config.ConfigTypeError
        )
      );
    });

    describe('migrations', function() {
      describe('with non-object', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({commands: {migrations: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('long', function() {
        it('sets long', function() {
          let testConfig = config.loadObject({
            commands: {migrations: {long: true}}
          });
          assert.equal(testConfig.commands.migrations.long, true);
        });

        describe('with non-boolean', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {migrations: {long: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('id', function() {
        it('sets id', function() {
          let testConfig = config.loadObject({
            commands: {migrations: {id: '123'}}
          });
          assert.equal(testConfig.commands.migrations.id, '123');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {migrations: {id: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });
    });

    describe('status', function() {
      describe('with non-object', function() {
        it('throws ConfigTypError', () =>
          assert.throws(
            () => config.loadObject({commands: {status: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('id', function() {
        it('sets id', function() {
          let testConfig = config.loadObject({
            commands: {status: {id: '123'}}
          });
          assert.equal(testConfig.commands.status.id, '123');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {status: {id: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });
    });

    describe('journal', function() {
      describe('with non-object', function() {
        it('throws ConfigTypError', () =>
          assert.throws(
            () => config.loadObject({commands: {journal: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('id', function() {
        it('sets id', function() {
          let testConfig = config.loadObject({
            commands: {journal: {id: '123'}}
          });
          assert.equal(testConfig.commands.journal.id, '123');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {journal: {id: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });
    });

    describe('create', function() {
      describe('with non-object', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({commands: {create: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('generateID', function() {
        it('sets generateID', function() {
          let testConfig = config.loadObject({
            commands: {create: {generateID: () => '123'}}
          });
          assert.equal(testConfig.commands.create.generateID(), '123');
        });

        describe('with non-function', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {create: {generateID: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('split', function() {
        it('sets split', function() {
          let testConfig = config.loadObject({
            commands: {create: {split: true}}
          });
          assert.equal(testConfig.commands.create.split, true);
        });

        describe('with non-boolean', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {create: {split: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('name', function() {
        it('sets name', function() {
          let testConfig = config.loadObject({
            commands: {create: {name: 'test'}}
          });
          assert.equal(testConfig.commands.create.name, 'test');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {create: {name: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('templatePaths', function() {
        describe('with non-object', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {create: {templatePaths: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });

        describe('combined', function() {
          it('sets combined', function() {
            let testConfig = config.loadObject({
              commands: {create: {templatePaths: {combined: 'test'}}}
            });
            assert.equal(testConfig.commands.create.templatePaths.combined, 'test');
          });

          describe('with non-string', function() {
            it('throws ConfigTypeError', () =>
              assert.throws(
                () => config.loadObject({
                  commands: {create: {templatePaths: {combined: true}}}
                }),
                config.ConfigTypeError
              )
            );
          });
        });

        describe('up', function() {
          it('sets up', function() {
            let testConfig = config.loadObject({
              commands: {create: {templatePaths: {up: 'test'}}}
            });
            assert.equal(testConfig.commands.create.templatePaths.up, 'test');
          });

          describe('with non-string', function() {
            it('throws ConfigTypeError', () =>
              assert.throws(
                () => config.loadObject({
                  commands: {create: {templatePaths: {up: true}}}
                }),
                config.ConfigTypeError
              )
            );
          });
        });

        describe('down', function() {
          it('sets down', function() {
            let testConfig = config.loadObject({
              commands: {create: {templatePaths: {down: 'test'}}}
            });
            assert.equal(testConfig.commands.create.templatePaths.down, 'test');
          });

          describe('with non-string', function() {
            it('throws ConfigTypeError', () =>
              assert.throws(
                () => config.loadObject({
                  commands: {create: {templatePaths: {down: true}}}
                }),
                config.ConfigTypeError
              )
            );
          });
        });
      });
    });

    describe('apply', function() {
      describe('with non-object', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({commands: {apply: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('method', function() {
        it('sets method', function() {
          let testConfig = config.loadObject({
            commands: {apply: {method: 'dry'}}
          });
          assert.equal(testConfig.commands.apply.method, config.Method.dry);
        });

        describe('with non-enum', function() {
          it('throws ConfigEnumError', () =>
            assert.throws(
              () => config.loadObject({commands: {apply: {method: 'what'}}}),
              config.ConfigEnumError
            )
          );
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {apply: {method: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('id', function() {
        let testConfig: config.Config;

        before(() =>
          testConfig = config.loadObject({
            commands: {apply: {id: '123'}}
          })
        );

        it('sets id', () =>
          assert.equal(testConfig.commands.apply.id, '123')
        );
        it('unsets pending', () =>
          assert.equal(testConfig.commands.apply.pending, false)
        );

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {apply: {id: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('to', function() {
        let testConfig: config.Config;

        before(() =>
          testConfig = config.loadObject({
            commands: {apply: {to: '123'}}
          })
        );

        it('sets to', () =>
          assert.equal(testConfig.commands.apply.to, '123')
        );
        it('unsets pending', () =>
          assert.equal(testConfig.commands.apply.pending, false)
        );

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {apply: {to: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('number', function() {
        let testConfig: config.Config;

        before(() =>
          testConfig = config.loadObject({
            commands: {apply: {number: 3}}
          })
        );

        it('sets number', () =>
          assert.equal(testConfig.commands.apply.number, 3)
        );
        it('unsets pending', () =>
          assert.equal(testConfig.commands.apply.pending, false)
        );

        describe('with non-number', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {apply: {number: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });
      });
    });

    describe('revert', function() {
      describe('with non-object', function() {
        it('throws ConfigTypeError', () =>
          assert.throws(
            () => config.loadObject({commands: {revert: 'string'}}),
            config.ConfigTypeError
          )
        );
      });

      describe('method', function() {
        it('sets method', function() {
          let testConfig = config.loadObject({
            commands: {revert: {method: 'dry'}}
          });
          assert.equal(testConfig.commands.revert.method, config.Method.dry);
        });

        describe('with non-enum', function() {
          it('throws ConfigEnumError', () =>
            assert.throws(
              () => config.loadObject({commands: {revert: {method: 'what'}}}),
              config.ConfigEnumError
            )
          );
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {revert: {method: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('number', function() {
        it('sets number', function() {
          let testConfig = config.loadObject({
            commands: {revert: {number: 3}}
          });
          assert.equal(testConfig.commands.revert.number, 3);
        });

        describe('with non-number', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {revert: {number: 'string'}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('id', function() {
        it('sets id', function() {
          let testConfig = config.loadObject({
            commands: {revert: {id: '123'}}
          });
          assert.equal(testConfig.commands.revert.id, '123');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {revert: {id: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });

      describe('to', function() {
        it('sets to', function() {
          let testConfig = config.loadObject({
            commands: {revert: {to: '123'}}
          });
          assert.equal(testConfig.commands.revert.to, '123');
        });

        describe('with non-string', function() {
          it('throws ConfigTypeError', () =>
            assert.throws(
              () => config.loadObject({commands: {revert: {to: true}}}),
              config.ConfigTypeError
            )
          );
        });
      });
    });
  });
});
