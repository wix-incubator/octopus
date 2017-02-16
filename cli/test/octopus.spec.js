const fixtures = require('./support/fixtures'),
  expect = require('chai').expect,
  octopus = require('../lib/octopus');

describe('octopus', function () {
  this.timeout(10000);

  it('should build module list sorted by dependencies for provided folder', () => {
    aProject().inDir(ctx => {
      const modules = octopus({cwd: ctx.dir}).modules.map(module => module.npm.name);
      expect(modules).to.deep.equal(['a', 'b', 'c']);
    });
  });

  it('should respect excludes', () => {
    aProject().inDir(ctx => {
      const modules = octopus({cwd: ctx.dir, excludes: ['a']}).modules.map(module => module.npm.name);
      expect(modules).to.deep.equal(['b', 'c']);
    });
  });

  it('should support module in root of repo', () => {
    return fixtures.project()
      .packageJson({name: 'root-module'})
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .inDir(ctx => {
        const modules = octopus({cwd: ctx.dir}).modules.map(module => module.npm.name);
        expect(modules).to.deep.equal(['a', 'root-module']);
      });
  });

  describe('merge', () => {
    it('should not write file for no changes', () => {
      aProject().inDir(ctx => {
        const octo = octopus({cwd: ctx.dir});
        octo.modules.forEach(module => module.markBuilt());
        ctx.exec('sleep 1;');

        octo.modules.forEach(module => module.merge({}, true));
        expect(octopus({cwd: ctx.dir}).modules.find(module => module.hasChanges())).to.be.undefined;
      });
    });
  });

  it('should only output stdout once if -v is provided and error is returned from process', done => {
    aProject().inDir(ctx => {
      try {
        ctx.octo('exec -v "echo \"test output\" && exit 1"');
        done(new Error('expected to fail'));
      }
      catch (err) {
        const out = err.output;
        expect(out).to.be.string('Executing \'octo exec \'echo test,output && exit 1\'\'\n a (a) (1/3)\ntest,output\nExit code: 1\n');
        done();
      }
    });
  });

  it('should output stdout even if -v is not provided and error is returned from process', done => {
    aProject().inDir(ctx => {
      try {
        ctx.octo('exec "echo \"test output\" && exit 1"');
        done(new Error('expected to fail'));
      }
      catch (err) {
        const out = err.output;
        expect(out).to.be.string('Executing \'octo exec \'echo test,output && exit 1\'\'\n a (a) (1/3)\nExit code: 1, output: test,output\n \n');
        done();
      }
    });
  });
  
  function aProject() {
    return fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}));
  }
});
