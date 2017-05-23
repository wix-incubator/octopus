const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {extraneous} = require('..');

describe('extraneous task', () => {

  it('should list dependencies present in managed*Dependencies, but not in modules', done => {
    const {reporter, project, start} = setup();

    project.within(() => {
      return start(extraneous())
        .then(() => done(new Error('expected failure')))
        .catch(e => {
          expect(reporter).to.have.been.calledWith('extraneous', 'info', 'Extraneous managedDependencies: adash, highdash');
          expect(reporter).to.have.been.calledWith('extraneous', 'info', 'Extraneous managedPeerDependencies: bar');
          expect(e.message).to.be.string('Extraneous dependencies found, see output above');
          done();
        });
    });
  });

  function setup() {
    const reporter = sinon.spy();
    const project = empty()
      .packageJson({
        name: 'root',
        private: true,
        managedDependencies: {lodash: '1.1.0', highdash: '1.1.0', adash: '1.1.0'},
        managedPeerDependencies: {foo: '> 1.0.0', bar: '> 1.0.0'}
      })
      .module('a', module => module.packageJson({
        name: 'a',
        version: '1.0.0',
        peerDependencies: {foo: '1'},
        devDependencies: {lodash: 'nope'}
      }))
      .module('b', module => module.packageJson({
        version: '1.0.0',
        dependencies: {a: '~1.0.0', lodash: '~1.0.0'}
      }));

    const start = new Start(reporter);

    return {reporter, project, start};
  }

});