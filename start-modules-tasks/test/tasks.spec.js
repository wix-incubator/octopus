const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  tasks = require('..'),
  sinon = require('sinon'),
  {modules} = require('octopus-modules');

describe('tasks', () => {

  describe('tasks.list', () => {

    it('should sync module versions', () => {
      const reporter = sinon.spy();
      const project = empty()
        .module('nested/a', module => module.packageJson({name: 'a', version: '2.0.0'}))
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}));

      return project.within(() => {
        const rawModulesList = modules();
        return Start(reporter)(tasks.modules.load()).then(taskModulesList => {
          expect(rawModulesList).to.deep.equal(taskModulesList);
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Loaded 2 modules');
        });
      });
    });
  });
});