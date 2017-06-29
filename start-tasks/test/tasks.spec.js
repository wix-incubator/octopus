const {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon'),
  {props, log, readJson, exec, ifTrue} = require('..'),
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
      return empty().within(() => {
        fs.writeJson('f.json', {key: 'value'});

        return start()(readJson('f.json')).then(res => {
          expect(res).to.deep.equal({key: 'value'});
        });
      });
    });
  });

  describe('exec', () => {

    it('executes a command, prints it and returns output', () => {
      const reporter = sinon.spy();

      return start(reporter)(exec('echo a')).then(res => {
        expect(reporter).to.have.been.calledWith(sinon.match.any, 'info', 'executing \'echo a\'');
        expect(res).to.equal('a\n');
      });
    });

    it('rejects on execution failure and log stdout/stdderr', done => {
      const reporter = sinon.spy();

      start(reporter)(exec('qweqweqweqwe qwe')).catch(e => {
        expect(e.message).to.be.string('message: \'Command failed: -c qweqweqweqwe qwe');
        expect(e.message).to.be.string('not found');
        done();
      });
    });

  });

  describe('ifTrue', () => {

    it('execute command if condition is true', () => {
      const fn = sinon.stub().returns(Promise.resolve());
      return start()(ifTrue(true)(fn)).then(() => {
        expect(fn).to.have.been.called;
      });
    });

    it('does not execute command if condition is false', () => {
      const fn = sinon.stub().returns(Promise.resolve());
      return start()(ifTrue(false)(fn)).then(() => {
        expect(fn).to.not.have.been.called;
      });
    });

  });

});