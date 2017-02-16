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
        expect(modules).to.deep.equal(['root-module', 'a']);
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

  function aProject() {
    return fixtures.project()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}}));
  }
});
