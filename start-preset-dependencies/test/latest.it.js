const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  Start = require('start').default,
  sinon = require('sinon'),
  {latest} = require('..'),
  {execSync} = require('child_process');

describe('latest task', function () {
  this.timeout(30000);

  it('should list dependencies that can be updated', () => {
    const ramdaVersion = execSync('npm info ramda dist-tags.latest').toString().trim('\n');
    const lodashVersion = execSync('npm info lodash dist-tags.latest').toString().trim('\n');
    const {reporter, project, start} = setup({
      managedDependencies: {
        lodash: 'latest',
        shelljs: '*',
        ramda: '0.0.1',
        url: '>0.0.1'
      },
      managedPeerDependencies: {
        ramda: '> 0.0.1',
        lodash: '0.0.1'
      }
    });

    return project.within(() => {
      return start(latest())
        .then(() => {
          expect(reporter).to.have.been.calledWith('latest', 'info', `Update found for dependency ramda: 0.0.1 -> ${ramdaVersion}`);
          expect(reporter).to.not.have.been.calledWith('latest', 'info', sinon.match('dependency lodash'));
          expect(reporter).to.not.have.been.calledWith('latest', 'info', sinon.match('dependency shelljs'));
          expect(reporter).to.not.have.been.calledWith('latest', 'info', sinon.match('dependency url'));

          expect(reporter).to.not.have.been.calledWith('latest', 'info', sinon.match('peerDependency ramda'));
          expect(reporter).to.have.been.calledWith('latest', 'info', `Update found for peerDependency lodash: 0.0.1 -> ${lodashVersion}`);
        });
    });
  });

  it('should not reject for missing managedDependencies, managedPeerDependencies', () => {
    const {project, start} = setup();

    return project.within(() => {
      return start(latest());
    });
  });

  function setup(packageJsonOverrides = {}) {
    const reporter = sinon.spy();
    const project = empty()
      .packageJson(Object.assign({
        name: 'root',
        private: true
      }, packageJsonOverrides));

    const start = new Start(reporter);

    return {reporter, project, start};
  }

});