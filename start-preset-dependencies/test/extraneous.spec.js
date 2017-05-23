const {logExtraneous} = require('../lib/extraneous'),
  {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon');

describe('extraneous', () => {

  describe('logExtraneous', () => {

    it('should not log extraneous if none present', () => {
      const log = sinon.spy();
      logExtraneous({deps: {}}, log, 'deps');

      expect(log).to.not.have.been.called;
    });
  });

});