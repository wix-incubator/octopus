const {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon'),
  {props, log} = require('..'),
  Start = require('start').default,
  inputConnector = require('start-input-connector').default;

describe('tasks', () => {

  describe('props', () => {

    it('should invoke provided object value functions with input and return mapped response', () => {
      return Start()(inputConnector('InputStr'), props({
        one: input => 'one' + input,
        two: input => 'two' + input
      })).then(res => expect(res).to.deep.equal({
        one: 'oneInputStr',
        two: 'twoInputStr'
      }));
    });

    it('should map promisified functions', () => {
      return Start()(inputConnector('InputStr'), props({
        one: input => 'one' + input,
        two: input => Promise.resolve(input).then(pInput => 'two' + pInput)
      })).then(res => expect(res).to.deep.equal({
        one: 'oneInputStr',
        two: 'twoInputStr'
      }));
    });
  });

  describe('log', () => {

    it('should log provided string and return original input', () => {
      const reporter = sinon.spy();
      return Start(reporter)(inputConnector('InputStr'), log('log entry')).then(res => {
          expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'log entry');
          expect(res).to.equal('InputStr');
        });
    });

    it('should log result of provided function over input and return original input', () => {
      const reporter = sinon.spy();
      return Start(reporter)(inputConnector('InputStr'), log(input => input + ' log entry')).then(res => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'InputStr log entry');
        expect(res).to.equal('InputStr');
      });
    });

  });

});