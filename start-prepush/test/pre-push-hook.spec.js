const {empty} = require('./support/fixtures'),
  {expect} = require('chai').use(require('sinon-chai')),
  prePush = require('..'),
  {readFileSync} = require('fs'),
  sinon = require('sinon');

describe('pre-push hook', () => {

  it('should add a pre-push hook', () => {
    const log = sinon.spy();
    const prePushHookFile = readFileSync('./files/pre-push').toString();
    const project = empty();

    return project.within(ctx => {
      return prePush()(log).then(() => {
        expect(log).to.have.been.calledWithMatch('Adding pre-push hook');
        expect(prePushHookFile).to.equal(ctx.readFile('.git/hooks/pre-push'))
      })
    });
  });
});