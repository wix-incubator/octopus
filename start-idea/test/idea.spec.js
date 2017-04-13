const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')),
  idea = require('..'),
  sinon = require('sinon'),
  shelljs = require('shelljs'),
  start = require('start').default;

describe('pre-push hook', () => {

  it('should generate idea project files', () => {
    return aProject().within(() => {
      return start()(idea()).then(() => {
        assertIdeaFilesGenerated();
      });
    });
  });

  it('should set language level to ES6', () => {
    return aProject().within(() => {
      return start()(idea()).then(() => {
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<property name="JavaScriptLanguageLevel" value="ES6" />');
      });
    });
  });

  it('removes existing .idea project files before generating new ones', () => {
    const reporter = sinon.spy();
    return aProject().within(() => {
      return start(reporter)(idea()).then(() => {

        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', sinon.match('rm -rf .idea && mkdir .idea && rm -f *.iml'));

        assertIdeaFilesGenerated();
      });
    });
  });

  it('generates [module-name].iml with node_modules excluded so idea would not index all deps', () => {
    return aProject().within(() => {
      return start()(idea()).then(() => {
        expect(shelljs.cat('a/a.iml').stdout).to.be.string('<excludeFolder url="file://$MODULE_DIR$/node_modules" />');
      });
    });
  });

  it('generates Mocha run configurations for all modules with mocha, interpreter and env set', () => {
    return aProject().within(() => {
      return start()(idea()).then(() => {
        const node = shelljs.exec('which node').stdout.split('/node/')[1].replace('\n', '');

        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('/node_modules/mocha');
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<configuration default="false" name="a" type="mocha-javascript-test-runner" factoryName="Mocha">');
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<env name="DEBUG" value="wix:*" />');
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<test-kind>PATTERN</test-kind>');
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string('<test-pattern>test/**/*.spec.js test/**/*.it.js</test-pattern>');
        expect(shelljs.cat('.idea/workspace.xml').stdout).to.be.string(`${node}</node-interpreter>`);
      });
    });
  });

  it('creates git-based ./idea/vcs.xml', () => {
    return aProject().within(() => {
      return start()(idea()).then(() => {
        expect(shelljs.cat('.idea/vcs.xml').stdout).to.be.string('<mapping directory="$PROJECT_DIR$" vcs="Git" />');
      });
    });
  });

  function aProject() {
    return empty()
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}}));
  }

  function assertIdeaFilesGenerated() {
    expect(shelljs.test('-d', '.idea')).to.equal(true);
    expect(shelljs.test('-f', '.idea/workspace.xml')).to.equal(true);
    expect(shelljs.test('-f', '.idea/vcs.xml')).to.equal(true);
    expect(shelljs.test('-f', '.idea/modules.xml')).to.equal(true);
    expect(shelljs.test('-f', 'a/a.iml')).to.equal(true);
    expect(shelljs.test('-f', 'b/b.iml')).to.equal(true);
  }
});