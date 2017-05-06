const {empty, fs} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  depcheck = require('..');

describe('depcheck', () => {

  it('should fail for extraneous dependency', done => {
    const project = empty()
      .module('b', module => {
        module.packageJson({version: '1.0.0', dependencies: {lodash: 'latest'}});
      });

    project.within(() => new Start()(depcheck()))
      .catch(err => {
        expect(err.message).to.be.string('module b has unused dependencies: lodash');
        done();
      });
  });

  it('should pass for no extraneous dependencies', () => {
    const project = empty()
      .module('a', module => {
        module.packageJson({name: 'a', version: '1.0.0'});
      })
      .module('b', module => {
        module.packageJson({version: '1.0.0', dependencies: {a: '~1.0.0'}});
        module.addFile('index.js', 'require("a")');
      });

    return project.within(() => new Start()(depcheck()));
  });

  it('should respect provided overrides', () => {
    const depcheckOptions = {ignoreMatches: ['lodash']};
    const project = empty()
      .module('b', module => {
        module.packageJson({version: '1.0.0', dependencies: {lodash: 'latest'}});
      });

    return project.within(() => new Start()(depcheck(depcheckOptions)));
  });


});