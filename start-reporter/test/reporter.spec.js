const {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon'),
  reporter = require('..');

describe('reporter', () => {

  it('should log messages', () => {
    const out = mockConsole();
    reporter(out)('fnName', 'info', 'bubu');

    expect(out.log).to.have.been.calledWith(sinon.match(/fnName.*bubu/));
  });

  it('should not log start/resolve messages', () => {
    const out = mockConsole();
    reporter(out)('fnName', 'start');
    reporter(out)('fnName', 'resolve');

    expect(out.log).to.not.have.been.called;
  });

  it('should not log messages without content', () => {
    const out = mockConsole();
    reporter(out)('fnName', 'info');

    expect(out.log).to.not.have.been.called;
  });

  it('should log error on failure', () => {
    const out = mockConsole();
    reporter(out)('fnName', 'reject', new Error('qwe'));

    expect(out.error).to.have.been.calledWith(sinon.match(/fnName.*failed with Error: qwe/));
  });

  function mockConsole() {
    return {
      log: sinon.spy(),
      error: sinon.spy()
    };
  }
});