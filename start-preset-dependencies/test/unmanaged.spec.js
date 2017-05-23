const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {unmanaged} = require('..');

describe('unmanaged task', () => {

  it('should list dependencies present in modules, but not in managed*Dependencies', done => {
    const {reporter, project, start} = setup();

    project.within(() => {
      return start(unmanaged())
        .then(() => done(new Error('expected failure')))
        .catch(e => {
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Unmanaged dependency highdash (1.1.0, 1.2.0)');
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'Unmanaged peerDependency bar (> 1.0.0)');
          expect(e.message).to.be.string('Unmanaged dependencies found, see output above');
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
        managedDependencies: {
          lodash: '1.1.0'
        },
        managedPeerDependencies: {
          foo: '> 1.0.0'
        }
      })
      .module('a', module => module.packageJson({
        name: 'a',
        version: '1.0.0',
        peerDependencies: {
          foo: '1',
          bar: '> 1.0.0'
        },
        devDependencies: {
          lodash: 'nope',
          highdash: '1.1.0'
        }
      }))
      .module('b', module => module.packageJson({
        version: '1.0.0',
        dependencies: {
          a: '~1.0.0',
          lodash: '~1.0.0',
          highdash: '1.2.0'
        }
      }));

    const start = new Start(reporter);

    return {reporter, project, start};
  }

});