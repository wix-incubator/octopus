const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')),
  sinon = require('sinon'),
  {assert} = require('..');

describe('git tasks', () => {

  describe('assert current branch', () => {

    it('should reject if provided branch does not match current', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('git checkout -b test');

        const promise = assert.branch('master')()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('expected branch to be master, but found test');
      });
    });

    it('should not reject if current branch matches provided', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('git checkout -b test');

        return assert.branch('test')()(log, reporter);
      });
    });
  });

  describe('assert up-to-date', () => {

    it('should reject if there are uncommited files', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('touch qwe.q && git add -A');

        const promise = assert.clean()()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('uncommitted changes found');
      });
    });

    it('should reject if there are un-added files', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('touch qwe.q');

        const promise = assert.clean()()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('uncommitted changes found');
      });
    });


    it('should not reject for clean repo', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(() => {
        return assert.clean()()(log, reporter);
      });
    });
  });

  describe('assert up-to-date', () => {

    it('should reject if provided branch is not-up-to-date with remote', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('git checkout -b test');
        ctx.exec('touch qwe.z && git add -A && git commit -am ok');

        const promise = assert.upToDateWith('master')()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('current is not up-to-date with master');
      });
    });

    it('should not reject for up-to-date branch', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(() => {
        return assert.upToDateWith('master')()(log, reporter);
      });
    });
  });

  function initialized() {
    return empty().inDir(ctx => {
      ctx.exec('git init && git config user.email mail@example.org && git config user.name name');
      ctx.exec('touch been-here');
      ctx.exec('git add -A && git commit -am ok');
    });
  }

});