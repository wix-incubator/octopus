const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  parallel = require('../../lib/parallel'),
  octopus = require('../../lib/octopus'),
  {aComplexProject, aProject} = require('../test-utils');

describe('parallel', () => {
  it('should call callback in correct module order', () => {
    const action = sinon.stub();
    action.returns(Promise.resolve());

    let promise;

    aComplexProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, action).then(() => {
        expect(action).to.have.callCount(4);

        expect(action.getCall(0)).to.be.calledWith(octo.modules[0]);
        expect(action.getCall(1)).to.be.calledWith(octo.modules[1]);
        expect(action.getCall(2)).to.be.calledWith(octo.modules[2]);
        expect(action.getCall(3)).to.be.calledWith(octo.modules[3]);
      });
    });

    return promise;
  });

  it('should not run module until its liabilities have completed', () => {
    const actionStarts = [];
    const actionFinishes = [];
    let promise;

    aProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, module => {
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
      }, 8);

      promise = promise.then(() => {
        expect(actionFinishes[0]).to.have.been.calledBefore(actionStarts[1]);
        expect(actionFinishes[1]).to.have.been.calledBefore(actionStarts[2]);
      })
    });

    return promise;
  });

  it('should run all independent projects before any has finished', () => {
    const action = sinon.spy();
    let promise;

    aComplexProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, module => {
        action(module);
        return new Promise(resolve => setTimeout(resolve, 50));
      }, 8);

      expect(action).to.have.callCount(3);
      expect(action.getCall(0)).to.be.calledWith(octo.modules[0]);
      expect(action.getCall(1)).to.be.calledWith(octo.modules[1]);
      expect(action.getCall(2)).to.be.calledWith(octo.modules[2]);

      promise = promise.then(() => {
        expect(action).to.have.callCount(4);
        expect(action.getCall(3)).to.be.calledWith(octo.modules[3]);
      })
    });

    return promise;
  });

  it('should not run more than maximum threads allowed', () => {
    const action = sinon.spy();
    let promise;

    aComplexProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, module => {
        action(module);
        return new Promise(resolve => setTimeout(resolve, 50));
      }, 2);

      expect(action).to.have.callCount(2);
      expect(action.getCall(0)).to.be.calledWith(octo.modules[0]);
      expect(action.getCall(1)).to.be.calledWith(octo.modules[1]);

      promise = promise.then(() => {
        expect(action).to.have.callCount(4);
        expect(action.getCall(2)).to.be.calledWith(octo.modules[2]);
        expect(action.getCall(3)).to.be.calledWith(octo.modules[3]);
      })
    });

    return promise;
  });

  it('should reject if async action rejects', () => {
    const error = new Error('some message');
    let promise;

    aComplexProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, () =>
        new Promise((resolve, reject) => reject(error))
      );
    });

    return expect(promise).to.eventually.be.rejectedWith(error);
  });
});
