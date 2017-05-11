const {empty, fs} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {sync} = require('..');

describe('modules tasks', () => {

  describe('sync', () => {

    it('should sync dependencies, depDependencies, peerDependencies defined in root package.json as managed*Dependencies', () => {
      const {reporter, project, start} = setup();

      return project.within(() => {

        return start(sync()).then(() => {
          expect(fs.readJson('a/package.json')).to.contain.deep.property('peerDependencies.foo', '> 1.0.0');
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'a: peerDependencies.foo (1 -> > 1.0.0)');

          expect(fs.readJson('a/package.json')).to.contain.deep.property('devDependencies.lodash', '1.1.0');
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'a: devDependencies.lodash (nope -> 1.1.0)');

          expect(fs.readJson('b/package.json')).to.contain.deep.property('dependencies.lodash', '1.1.0');
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'b: dependencies.lodash (~1.0.0 -> 1.1.0)');
        });
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
          foo: '1'
        },
        devDependencies: {
          lodash: 'nope'
        }
      }))
      .module('b', module => module.packageJson({
        version: '1.0.0',
        dependencies: {
          a: '~1.0.0',
          lodash: '~1.0.0'
        }
      }));

    const start = new Start(reporter);

    return {reporter, project, start};
  }

});