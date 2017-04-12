const {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon'),
  {props, log, readJson, exec} = require('..'),
  start = require('start').default,
  inputConnector = require('start-input-connector').default,
  {empty, fs} = require('octopus-test-utils');

describe('tasks', () => {

  describe('props', () => {

    it('should invoke provided object value functions with input and return mapped response', () => {
      return start()(inputConnector('InputStr'), props({
        one: input => 'one' + input,
        two: input => 'two' + input
      })).then(res => expect(res).to.deep.equal({
        one: 'oneInputStr',
        two: 'twoInputStr'
      }));
    });

    it('should map promisified functions', () => {
      return start()(inputConnector('InputStr'), props({
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
      return start(reporter)(inputConnector('InputStr'), log('log entry')).then(res => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'log entry');
        expect(res).to.equal('InputStr');
      });
    });

    it('should log result of provided function over input and return original input', () => {
      const reporter = sinon.spy();
      return start(reporter)(inputConnector('InputStr'), log(input => input + ' log entry')).then(res => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'InputStr log entry');
        expect(res).to.equal('InputStr');
      });
    });

  });

  describe('readJson', () => {

    it('should log result of provided function over input and return original input', () => {
      empty().within(() => {
        fs.writeJson('f.json', {key: 'value'});

        return start()(readJson('f.json')).then(res => {
          expect(res).to.deep.equal({key: 'value'});
        });
      });
    });
  });

  describe('exec', () => {

    it('executes a command and returns output', () => {
      return start()(exec('echo a')).then(res => {
        expect(res.stdout).to.equal('a');
      });
    });
  });
});