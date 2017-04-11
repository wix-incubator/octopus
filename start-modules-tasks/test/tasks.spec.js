const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  tasks = require('..'),
  sinon = require('sinon'),
  {modules} = require('octopus-modules');

describe('tasks', () => {

  describe('tasks.list', () => {

    it('return list of loaded modules and log count', () => {
      const {reporter, start, project} = setup();

      return project.within(() => {
        const rawModulesList = modules();
        return start(tasks.modules.load()).then(taskModulesList => {
          expect(rawModulesList).to.deep.equal(taskModulesList);
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Loaded 2 modules');
        });
      });
    });
  });

  describe('tasks.forEach', () => {

    it('should iterate over provided modules, log info and return results of provided function', () => {
      const {reporter, start, project} = setup();
      const iterFn = item => item.name;

      return project.within(() => {
        return start(tasks.modules.load(), tasks.iter.forEach()(iterFn)).then(res => {
          expect(res).to.deep.equal(['a', 'b']);
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'a (nested/a) (1/2)');
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'b (b) (2/2)');
        });
      });
    });

    it('should not return falsy values', () => {
      const {log, project} = setup();
      const iterFn = item => item.name === 'a' && item.name;
      const projectModules = modules(project.dir);

      return tasks.iter.forEach()(iterFn)(projectModules)(log)
        .then(res => expect(res).to.deep.equal(['a']));
    });

    it('should map input if function is provided', () => {
      const {log, project} = setup();
      const iterFn = sinon.spy();
      const projectModules = {nestedModules: modules(project.dir)};

      return tasks.iter.forEach({mapInput: input => input.nestedModules})(iterFn)(projectModules)(log)
        .then(() => expect(iterFn).to.have.been.calledTwice);
    });

    it('not log if silent is set to true', () => {
      const {log, project} = setup();
      const iterFn = sinon.spy();
      const projectModules = modules(project.dir);
      return tasks.iter.forEach({silent: true})(iterFn)(projectModules)(log)
        .then(() => expect(log).to.not.have.been.called);
    });
  });

  function setup() {
    const reporter = sinon.spy();
    const log = sinon.spy();
    const project = empty()
      .module('nested/a', module => module.packageJson({name: 'a', version: '2.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}));
    const start = Start(reporter);

    return {reporter, project, start, log};
  }


});