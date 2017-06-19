const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  {run} = require('..'),
  {iter} = require('octopus-start-modules-tasks'),
  sinon = require('sinon'),
  {modules} = require('octopus-modules'),
  inputConnector = require('start-input-connector').default;

describe('npm', () => {

  it('should run npm script', () => {
    const {start, project, reporter} = setup(builder => builder.module('a', module => module.packageJson({
      version: '1.0.0',
      scripts: {'a-script': 'echo a-script-echo'}
    })));

    return project.within(() => {
      const rawModulesList = modules();
      return start(
        inputConnector(rawModulesList),
        iter.forEach()(item => start(
          run(item)('a-script'),
          scriptOutput => log => Promise.resolve().then(() => log(scriptOutput))
        ))
      ).then(() => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', sinon.match('a-script-echo'));
      })
    });
  });

  it('should not run npm script if it is missing', () => {
    const {start, project, reporter} = setup(builder => builder.module('a', module => module.packageJson({
      version: '1.0.0'
    })));

    return project.within(() => {
      const rawModulesList = modules();
      return start(
        inputConnector(rawModulesList),
        iter.forEach()(item => start(
          run(item)('a-script'),
          scriptOutput => log => Promise.resolve().then(() => log(scriptOutput))
        ))
      ).then(() => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', sinon.match('script a-script not found'));
      })
    });
  });

  function setup(setupModules) {
    const reporter = sinon.spy();
    const log = sinon.spy();
    const project = empty();
    setupModules(project);
    const start = new Start(reporter);

    return {reporter, project, start, log};
  }
});
