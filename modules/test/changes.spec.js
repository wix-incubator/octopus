const fixtures = require('octopus-test-utils'),
  {expect} = require('chai').use(require('chai-shallow-deep-equal')),
  {modules, removeUnchanged, markBuilt, markUnbuilt} = require('..'),
  {makePackageBuilt} = require('../lib/detect-changes');

describe('package changes', () => {

  describe('removeUnchanged', () => {

    it('should return empty array if all modules are built', () => {
      const project = fixtures.empty()
        .module('a', module => module.packageJson({name: 'a', version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))

      return project.within(() => {
        makePackageBuilt('a');
        makePackageBuilt('b');

        const loadedModules = modules();
        expect(removeUnchanged(loadedModules).length).to.equal(0);
      });
    });

    it.only('should filter-out unchanged modules', () => {
      const project = fixtures.empty()
        .module('a', module => module.packageJson({name: 'a', version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))

      return project.within(() => {
        makePackageBuilt('b');

        const loadedModules = modules();
        const unchangedModuleNames = removeUnchanged(loadedModules).map(module => module.name);
        expect(unchangedModuleNames).to.deep.equal(['a']);
      });
    });

    it('should include dependencies of changed modules', () => {
      const project = fixtures.empty()
        .module('a', module => module.packageJson({name: 'a', version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))
        .module('c', module => module.packageJson({version: '1.0.0', dependencies: {'b': '~1.0.0'}}));

      return project.within(() => {
        makePackageBuilt('c');

        const loadedModules = modules();
        const unchangedModuleNames = removeUnchanged(loadedModules).map(module => module.name);
        expect(unchangedModuleNames).to.deep.equal(['a', 'b']);
      });
    });
  });

  describe('mark', () => {

    it('should mark package as built', () => {
      const project = fixtures.empty()
        .module('a', module => module.packageJson({name: 'a', version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))

      return project.within(() => {
        const loadedModules = modules();

        loadedModules.forEach(markBuilt);

        expect(removeUnchanged(loadedModules).length).to.equal(0);
      });
    });

    it('should mark package as unbuilt', () => {
      const project = fixtures.empty()
        .module('a', module => module.packageJson({name: 'a', version: '1.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))

      return project.within(() => {
        const loadedModules = modules();

        loadedModules.forEach(markBuilt);
        expect(removeUnchanged(loadedModules).length).to.equal(0);

        loadedModules.forEach(markUnbuilt);
        expect(removeUnchanged(loadedModules).length).to.equal(2);
      });
    });

  });
});
