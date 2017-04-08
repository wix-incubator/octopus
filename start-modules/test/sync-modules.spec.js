const {empty, fs} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {tasks} = require('..');

describe.only('start list task', function () {
  this.timeout(5000);

  it('should list loaded modules', () => {
    const reporter = sinon.spy();
    const project = empty()
      .module('a', module => module.packageJson({name: 'a', version: '2.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.0', dependencies: {'a': '~1.0.0'}}));

    return project.within(() => {
      const start = Start();

      return tasks.sync(start)().then(() => {
        expect(fs.readJson('b/package.json')).to.contain.deep.property('dependencies.a', "2.0.0");
      });
    });
  });
});