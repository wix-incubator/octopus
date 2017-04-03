const {empty} = require('./support/fixtures'),
  {expect} = require('chai'),
  prePush = require('..'),
  {readFileSync} = require('fs');


describe.only('pre-push hook', () => {

  it('should add a pre-push hook', () => {
    const prePushHookFile = readFileSync('./files/pre-push').toString();
    const project = empty()
      .inDir(ctx => ctx.exec('git init && git config user.email mail@example.org && git config user.name name'));

    return project.within(ctx => {
      return prePush()()()
        .then(() => expect(prePushHookFile).to.equal(ctx.readFile('.git/hooks/pre-push')))
    });
  });
});