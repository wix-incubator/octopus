const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {tasks} = require('..');

describe.only('start list task', function () {
  this.timeout(5000);

  it('should list loaded modules', () => {
    const reporter = sinon.spy();
    const project = empty()
      .packageJson({name: 'root', private: true, dependencies: {name: 'a', version: '1.0.0'}})
      .module('nested/a', module => module.packageJson({name: 'a', version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}));

    return project.within(() => {
      const start = Start();

      return tasks.list(start)().then(() => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match('a (nested/a) (1/2)'));
        expect(reporter).to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match('b (b) (2/2)'));
      });
    });
  });
});