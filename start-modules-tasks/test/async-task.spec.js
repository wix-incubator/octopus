const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  asyncTask = require('../lib/async-task'),
  {modules, markBuilt} = require('octopus-modules'),
  {empty} = require('octopus-test-utils');

describe('async-task', () => {

  it('should call callback in correct module order', () => {
    const action = sinon.stub();
    const reporter = sinon.spy();
    const log = sinon.spy();
    action.returns(Promise.resolve());

    return aComplexProject().within(() => {
      const loadedModules = modules();
      const promise = asyncTask()(action)(loadedModules)(log, reporter).then(() => {
        expect(action).to.have.callCount(4);

        expect(action.getCall(0)).to.be.calledWith(loadedModules[0]);
        expect(action.getCall(1)).to.be.calledWith(loadedModules[1]);
        expect(action.getCall(2)).to.be.calledWith(loadedModules[2]);
        expect(action.getCall(3)).to.be.calledWith(loadedModules[3]);
      });

      return promise;
    });
  });

  it('should not run module until its liabilities have completed', () => {
    const reporter = sinon.spy();
    const log = sinon.spy();

    const actionStarts = [];
    const actionFinishes = [];

    const action = module => {
      const spy = sinon.spy();
      actionStarts.push(spy);
      spy(module);
      return new Promise(resolve =>
        setTimeout(() => {
          const spy = sinon.spy();
          actionFinishes.push(spy);
          spy(module);
          resolve();
        }, 50));
    };

    return aProject().within(() => {
      const loadedModules = modules();
      return asyncTask({threads: 8})(action)(loadedModules)(log, reporter).then(() => {
        expect(actionFinishes[0]).to.have.been.calledBefore(actionStarts[1]);
        expect(actionFinishes[1]).to.have.been.calledBefore(actionStarts[2]);
      });
    });
  });

  it('should run all independent projects before any has finished', () => {
    const action = sinon.spy();
    const reporter = sinon.spy();
    const log = sinon.spy();

    const asyncAction = module => {
      action(module);
      return new Promise(resolve => setTimeout(resolve, 50));
    };

    return aComplexProject().within(() => {
      const loadedModules = modules();
      const promise = asyncTask({threads: 8})(asyncAction)(loadedModules)(log, reporter);

      //TODO: not great
      expect(action).to.have.callCount(3);
      expect(action.getCall(0)).to.be.calledWith(loadedModules[0]);
      expect(action.getCall(1)).to.be.calledWith(loadedModules[1]);
      expect(action.getCall(2)).to.be.calledWith(loadedModules[2]);

      return promise.then(() => {
        expect(action).to.have.callCount(4);
        expect(action.getCall(3)).to.be.calledWith(loadedModules[3]);
      });
    });
  });

  it('should not run more than maximum threads allowed', () => {
    const action = sinon.spy();
    const reporter = sinon.spy();
    const log = sinon.spy();

    const asyncAction = module => {
      action(module);
      return new Promise(resolve => setTimeout(resolve, 50));
    };

    return aComplexProject().within(() => {
      const loadedModules = modules();
      const promise = asyncTask({threads: 2})(asyncAction)(loadedModules)(log, reporter);

      expect(action).to.have.callCount(2);
      expect(action.getCall(0)).to.be.calledWith(loadedModules[0]);
      expect(action.getCall(1)).to.be.calledWith(loadedModules[1]);

      return promise.then(() => {
        expect(action).to.have.callCount(4);
        expect(action.getCall(2)).to.be.calledWith(loadedModules[2]);
        expect(action.getCall(3)).to.be.calledWith(loadedModules[3]);
      });
    });
  });

  it('should filter-out extraneous dependencies', () => {
    const action = sinon.stub();
    const reporter = sinon.spy();
    const log = sinon.spy();
    action.returns(Promise.resolve());

    return aComplexProject().within(() => {
      const loadedModules = modules();
      const partialModules = loadedModules.filter(module => module.name === 'c' || module.name === 'd');

      return asyncTask()(action)(partialModules)(log, reporter)
        .then(() => expect(action).to.have.callCount(2));
    });
  });

  it('should reject if async action rejects', () => {
    const reporter = sinon.spy();
    const log = sinon.spy();
    const error = new Error('some message');
    const asyncAction = () => new Promise((resolve, reject) => reject(error));

    return aComplexProject().within(() => {
      const loadedModules = modules();
      const promise = asyncTask()(asyncAction)(loadedModules)(log, reporter);

      return expect(promise).to.eventually.be.rejectedWith(error)
    });
  });

  it('should return provided input to next task', () => {
    const action = sinon.stub();
    const reporter = sinon.spy();
    const log = sinon.spy();
    action.returns(Promise.resolve('ok'));

    return aComplexProject().within(() => {
      const loadedModules = modules();
      return asyncTask()(action)(loadedModules)(log, reporter).then(result => {
        expect(result).to.deep.equal(loadedModules);
      });
    });
  });

  function aComplexProject({scripts} = {}) {
    const a = '~1.0.0';
    const b = '~1.0.1';
    const c = '~1.1.0';

    return empty()
      .module('a', module => module.packageJson({version: '1.0.0', scripts}))
      .module('b', module => module.packageJson({version: '1.0.1', scripts}))
      .module('c', module => module.packageJson({version: '1.1.0', scripts}))
      .module('d', module => module.packageJson({version: '1.0.0', scripts, dependencies: {a, b, c}}))
  }

  function aProject({scripts} = {}) {
    return empty()
      .module('a', module => module.packageJson({version: '1.0.0', scripts}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}, scripts}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}, scripts}));
  }

})
;
