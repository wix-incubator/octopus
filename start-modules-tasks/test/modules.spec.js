const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  tasks = require('..'),
  sinon = require('sinon'),
  {modules, markBuilt} = require('octopus-modules'),
  inputConnector = require('start-input-connector').default;

describe('tasks', () => {

  describe('modules.load', () => {

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

  describe('modules.removeUnchanged', () => {

    it('removes modules without changes', () => {
      const {reporter, start, project} = setup();

      return project.within(() => {
        const rawModulesList = modules();
        markBuilt(rawModulesList[0]);
        return start(inputConnector(rawModulesList), tasks.modules.removeUnchanged()).then(filteredModules => {
          expect(filteredModules.length).to.equal(1);
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Filtered-out 1 unchanged modules');
        });
      });
    });
  });

  describe('modules.removeGitUnchanged', () => {

    it('removes modules without changes', () => {
      const reporter = sinon.spy();
      const start = new Start(reporter);

      return empty()
        .module('nested/a', module => module.packageJson({name: 'a', version: '2.0.0'}))
        .module('ba', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))
        .inDir(ctx => {
          ctx.exec('git init && git config user.email mail@example.org && git config user.name name');
          ctx.exec('git add -A && git commit -am ok');
          ctx.exec('git checkout -b test');
        })
        .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}))
        .inDir(ctx => {
          ctx.exec('git add -A && git commit -am ok');
        })
        .within(() => {
          const rawModulesList = modules();
          return start(inputConnector(rawModulesList), tasks.modules.removeGitUnchanged('master')).then(filteredModules => {
            expect(filteredModules.length).to.equal(1);
            expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Filtered-out 2 unchanged modules');
          });
        });
    });
  });

  describe('modules.removeUnchanged', () => {

    it('removes modules without changes', () => {
      const {reporter, start, project} = setup();

      return project.within(() => {
        const rawModulesList = modules();
        markBuilt(rawModulesList[0]);
        return start(
          inputConnector(rawModulesList),
          tasks.modules.removeUnchanged(),
          tasks.modules.removeExtraneousDependencies())
          .then(filteredModules => {
            expect(filteredModules.length).to.equal(1);
            expect(filteredModules[0].dependencies.length).to.equal(0);
            expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Cleaned extraneous dependencies');
          });
      });
    });
  });

  describe('modules.markBuilt', () => {

    it('marks module as built', () => {
      const {reporter, start, project} = setup();

      return project.within(() => {
        const rawModulesList = modules();
        return start(
          inputConnector(rawModulesList),
          tasks.iter.forEach()(item => start(tasks.module.markBuilt(item))),
          inputConnector(rawModulesList),
          tasks.modules.removeUnchanged()).then(filteredModules => {
            expect(filteredModules.length).to.equal(0);
            expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Filtered-out 2 unchanged modules');
          }
        );
      });
    });
  });

  describe('modules.markUnbuilt', () => {

    it('marks module as unbuilt', () => {
      const {start, project} = setup();

      return project.within(() => {
        const rawModulesList = modules();
        return start(
          inputConnector(rawModulesList),
          tasks.iter.forEach()(item => start(tasks.module.markBuilt(item))),
          inputConnector(rawModulesList),
          tasks.modules.removeUnchanged()).then(filteredModules => {
            expect(filteredModules.length).to.equal(0);

            return start(
              inputConnector(rawModulesList),
              tasks.iter.forEach()(item => start(tasks.module.markUnbuilt(item))),
              inputConnector(rawModulesList),
              tasks.modules.removeUnchanged()).then(filteredModules => {
                expect(filteredModules.length).to.equal(2);
              }
            );
          }
        );
      });
    });
  });

  describe('iter.forEach', () => {

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


      return project.within(() => {
        const projectModules = modules();
        return tasks.iter.forEach()(iterFn)(projectModules)(log)
          .then(res => expect(res).to.deep.equal(['a']));
      });
    });

    it('should map input if function is provided', () => {
      const {log, project} = setup();
      const iterFn = sinon.spy();

      return project.within(() => {
        const projectModules = {nestedModules: modules()};

        return tasks.iter.forEach({mapInput: input => input.nestedModules})(iterFn)(projectModules)(log)
          .then(() => expect(iterFn).to.have.been.calledTwice);
      });
    });

    it('not log if silent is set to true', () => {
      const {log, project} = setup();
      const iterFn = sinon.spy();

      return project.within(() => {
        const projectModules = modules();
        return tasks.iter.forEach({silent: true})(iterFn)(projectModules)(log)
          .then(() => expect(log).to.not.have.been.called);
      });
    });
  });

  function setup() {
    const reporter = sinon.spy();
    const log = sinon.spy();
    const project = empty()
      .module('nested/a', module => module.packageJson({name: 'a', version: '2.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}));
    const start = new Start(reporter);

    return {reporter, project, start, log};
  }


});