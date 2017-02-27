const chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  parallel = require('../../lib/parallel'),
  octopus = require('../../lib/octopus'),
  chaiAsPromised = require('chai-as-promised'),
  aComplexProject = require('../test-utils').aComplexProject;

chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;

describe.only('parallel', () => {
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

  it('should run all independent projects before any has finished', () => {
    const action = sinon.spy();
    let promise;

    aComplexProject().inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      promise = parallel(octo.modules, module => {
        action(module);
        return new Promise(resolve =>
          setTimeout(resolve, 50));
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
        return new Promise(resolve =>
          setTimeout(resolve, 50));
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
        new Promise((resolve, reject) =>
          reject(error))
      );
    });

    return expect(promise).to.eventually.be.rejectedWith(error);
  });
});
