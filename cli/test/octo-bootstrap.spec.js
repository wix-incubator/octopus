const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('octo-bootstrap', function () {
  this.timeout(20000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help bootstrap');

      expect(out).to.be.string('Usage: octo bootstrap');
    });
  });

  it('should allow execution from path within project', () => {
    fixtures.project().inDir(ctx => {
      ctx.module('a', () => {
        const out = ctx.octo('bootstrap');

        expect(out).to.be.string('Executing \'octo bootstrap\'');
      });
    });
  });

  it('should execute scpts.clean if -c flag is provided', () => {
    fixtures.project({scripts: {clean: 'echo ok > cleaned'}})
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .inDir(ctx => {
        const out = ctx.octo('bootstrap -c');
        expect(shelljs.test('-f', 'a/cleaned')).to.equal(true);
        expect(out).to.be.string('Running clean script');
      });
  });

  it('should print warning if -c provided, but no scripts.clean present in octopus.json', () => {
    fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .inDir(ctx => {
        const out = ctx.octo('bootstrap -c');

        expect(out).to.be.string('-c provided, but no scripts.clean');
      });
  });

  ['npm', 'yarn'].forEach(engine => {
    it(`should install and link modules via ${engine}`, () => {
      aProject(engine).inDir(ctx => {
        const out = ctx.octo('bootstrap');

        expect(out).to.be.string('Executing \'octo bootstrap\'');

        expect(out).to.be.string('a (a) (1/3)');
        expect(out).to.be.string('b (b) (2/3)');
        expect(out).to.be.string('c (c) (3/3)');
        expect(out).to.be.string(`${engine} install`);

        expect(shelljs.test('-L', 'b/node_modules/a')).to.equal(true);
        expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);
      });
    });

    it(`should install and link when module name is different than dir name using ${engine}`, () => {
      aConfusingProject(engine).inDir(ctx => {
        const out = ctx.octo('bootstrap');

        expect(out).to.be.string('Executing \'octo bootstrap\'');

        expect(shelljs.test('-L', 'b/node_modules/pkg-name')).to.equal(true);
      });
    });
  });

  it('should display output from underlying commands if -v is provided', () => {
    aProject().inDir(ctx => {
      const out = ctx.octo('bootstrap -v');

      expect(out).to.be.string('Executing \'octo bootstrap\'');
      expect(out).to.be.string('a (a) (1/3)');
      expect(out).to.be.string('npm WARN a@1.0.0 No description');
    });
  });

  it('should rebuild all modules if -a is provided', () => {
    aProject().inDir(ctx => {
      ctx.octo('modules build');
      expect(ctx.octo('bootstrap')).to.be.string('no modules with changes found');

      const out = ctx.octo('bootstrap -a');
      expect(out).to.be.string('Executing \'octo bootstrap\'');
      expect(out).to.be.string('a (a) (1/3)');
      expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);
    });
  });

  it('should not mark modules as built if -n flag is provided', () => {
    aProject().inDir(ctx => {
      const out = ctx.octo('bootstrap -n');
      expect(out).to.be.string('Executing \'octo bootstrap\'');
      expect(out).to.be.string('a (a) (1/3)');
      expect(shelljs.test('-L', 'c/node_modules/b')).to.equal(true);

      const out2 = ctx.octo('bootstrap -n');
      expect(out2).to.be.string('Executing \'octo bootstrap\'');
      expect(out2).to.be.string('a (a) (1/3)');
    });
  });

  function aConfusingProject(engine) {
    return fixtures.project({engine})
      .module('dir-name', module => module.packageJson({name: 'pkg-name', version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'pkg-name': '~1.0.0'}}));
  }

  function aProject(engine) {
    const scripts = {
      test: 'echo | pwd | grep -o \'[^/]*$\' > tested',
      verify: 'echo | pwd | grep -o \'[^/]*$\' > verified'
    };
    return fixtures.project({engine})
      .module('a', module => module.packageJson({version: '1.0.0', scripts}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}, scripts}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.0'}, scripts}));
  }
});
