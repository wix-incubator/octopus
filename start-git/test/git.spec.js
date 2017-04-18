const {empty} = require('octopus-test-utils'),
  {expect} = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')),
  sinon = require('sinon'),
  git = require('..'),
  _ = require('lodash'),
  exec = require('child_process').execSync,
  dateformat = require('dateformat');

describe('git tasks', () => {

  describe('assert current branch', () => {

    it('should reject if provided branch does not match current', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('git checkout -b test');

        const promise = git.assert.branch('master')()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('expected branch to be master, but found test');
      });
    });

    it('should not reject if current branch matches provided', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('git checkout -b test');

        return git.assert.branch('test')()(log, reporter);
      });
    });
  });

  describe('assert up-to-date', () => {

    it('should reject if there are uncommited files', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('touch qwe.q && git add -A');

        const promise = git.assert.clean()()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('uncommitted changes found');
      });
    });

    it('should reject if there are un-added files', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {
        ctx.exec('touch qwe.q');

        const promise = git.assert.clean()()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('uncommitted changes found');
      });
    });


    it('should not reject for clean repo', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(() => {
        return git.assert.clean()()(log, reporter);
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

        const promise = git.assert.upToDateWith('master')()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('current is not up-to-date with master');
      });
    });

    it('should not reject for up-to-date branch', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(() => {
        return git.assert.upToDateWith('master')()(log, reporter);
      });
    });
  });

  describe('get latest tag', () => {

    it('should return latest tag by expression', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      const format = timeMs => dateformat(timeMs, 'yyy-MM-dd-HH_mm_ss_l');
      return initialized().within(ctx => {
        const now = Date.now();

        ctx.exec(`git tag 'GA-smth-${format(now - 100)}'`);
        ctx.exec(`git tag 'GA-smth-${format(now - 50)}'`);
        ctx.exec(`git tag 'GA-smth-${format(now)}'`);

        return git.latestTag('GA-smth-*')()(log, reporter).then(tag => {
          expect(tag).to.equal(`GA-smth-${format(now)}`);
        });
      });
    });

    it('should fail if no tags matching pattern found', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();

      return initialized().within(ctx => {
        const promise = git.latestTag('GA-smth-*')()(log, reporter);

        return expect(promise).to.eventually.be.rejectedWith('not tags matching pattern GA-smth-* found');
      });
    });
  });

  describe('tag', () => {

    it('should create a git tag', () => {
      const log = sinon.spy();
      const reporter = sinon.spy();
      return initialized().within(ctx => {

        return git.tag('GA-smth-*')()(log, reporter).then(createdTag => {
          const tag = _.compact(exec(`git tag -l --sort=taggerdate 'GA-smth-*'`).toString().split('\n')).pop();
          expect(tag).to.equal(createdTag);
        });
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