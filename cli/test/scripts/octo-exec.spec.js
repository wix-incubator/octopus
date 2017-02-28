const fixtures = require('./../support/fixtures'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  {aProject, aComplexProject} = require('../test-utils');

describe('octo-exec', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help exec');

      expect(out).to.be.string('Usage: octo exec');
    });
  });

  it('should display help if no command is provided', () => {
    fixtures.project().inDir(ctx => {
      expect(() => ctx.octo('exec')).to.throw('Usage: octo exec');
    });
  });

  it('should be noop with message if no modules with changes present', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('exec -a echo 1');

      expect(out).to.be.string('no modules found');
    });
  });

  it('should be noop with message if no modules present and --all is provided', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('exec echo 1');

      expect(out).to.be.string('no modules with changes found');
    });
  });

  it('should exec command only to modules with changes by default', () => {
    aProject().markBuilt().inDir(ctx => {
      ctx.exec('sleep 2; touch c/touch');
      const out = ctx.octo('exec "echo | pwd | grep -o \'[^/]*$\' > echoed"');

      expect(out).to.be.string('Executing \'octo exec \'echo');
      expect(out).to.be.string('c (c) (1/1)');
      expect(out).to.not.be.string('a (a)');
      expect(out).to.not.be.string('b (b)');

      expect(shelljs.test('-f', 'a/echoed')).to.equal(false);
      expect(shelljs.test('-f', 'b/echoed')).to.equal(false);
      expect(ctx.readFile('c/echoed')).to.equal('c\n');

      expect(ctx.octo('exec "echo 1"')).to.not.be.string('c (c) (1/1)');
    });
  });

  describe('-v verbose', () => {
    it('should display output from underlying commands', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('exec -v "cat package.json"');

        expect(out).to.be.string('"name": "c",');
      });
    });

    it('should display output from underlying commands in parallel -p mode', () => {
      aProject().inDir(ctx => {
        const out = ctx.octo('exec -p -v "cat package.json"');

        expect(out).to.be.string('"name": "c",');
      });
    });
  });
  
  it('should exec provided command and not mark module as built if -n is provided', () => {
    aProject().inDir(ctx => {

      expect(ctx.octo('exec -n "echo 1"')).to.be.string('c (c) (3/3)');
      expect(ctx.octo('exec "echo 1"')).to.be.string('c (c) (3/3)');
    });
  });
  
  it('should exec command to all modules if --all is provided', () => {
    aProject().markBuilt().inDir(ctx => {
      const out = ctx.octo('exec --all "echo | pwd | grep -o \'[^/]*$\' > echoed"');

      expect(out).to.be.string('Executing \'octo exec');
      expect(out).to.be.string('a (a) (1/3)');
      expect(out).to.be.string('b (b) (2/3)');
      expect(out).to.be.string('c (c) (3/3)');

      expect(ctx.readFile('a/echoed')).to.equal('a\n');
      expect(ctx.readFile('b/echoed')).to.equal('b\n');
      expect(ctx.readFile('c/echoed')).to.equal('c\n');
    });
  });

  describe('parallel', () => {
    it('should run in parallel', () => {
      aComplexProject().inDir(ctx => {
        const out = ctx.octo('exec \'echo aaa\' -p');

        expect(out).to.be.string('Executing \'octo exec \'echo aaa\'\'');

        expect(out).to.be.string('Starting module: a (a) (1/4)');
        expect(out).to.be.string('Finished module: a (a) (1/4)');
        expect(out).to.be.string('Starting module: b (b) (2/4)');
        expect(out).to.be.string('Finished module: b (b) (2/4)');
        expect(out).to.be.string('Starting module: c (c) (3/4)');
        expect(out).to.be.string('Finished module: c (c) (3/4)');
        expect(out).to.be.string('Finished module: d (d) (4/4)');
        expect(out).to.be.string('Finished module: d (d) (4/4)');

        // Should start 3 independent modules before finishing any module
        const firstFinishedModule = out.indexOf('Finished module');
        const beforeFirstFinished = out.slice(0, firstFinishedModule);
        expect(beforeFirstFinished).to.be.string('Starting module: a (a) (1/4)');
        expect(beforeFirstFinished).to.be.string('Starting module: b (b) (2/4)');
        expect(beforeFirstFinished).to.be.string('Starting module: c (c) (3/4)');

        expect(out).to.be.string('a: echo aaa');
        expect(out).to.be.string('b: echo aaa');
        expect(out).to.be.string('c: echo aaa');
        expect(out).to.be.string('d: echo aaa');
      });
    });

    it('limit max threads to -p provided param', () =>{
      aComplexProject().inDir(ctx => {
        const out = ctx.octo('exec \'echo aaa\' -p 2');

        expect(out).to.be.string('Executing \'octo exec \'echo aaa\'\'');

        expect(out).to.be.string('Starting module: a (a) (1/4)');
        expect(out).to.be.string('Finished module: a (a) (1/4)');
        expect(out).to.be.string('Starting module: b (b) (2/4)');
        expect(out).to.be.string('Finished module: b (b) (2/4)');
        expect(out).to.be.string('Starting module: c (c) (3/4)');
        expect(out).to.be.string('Finished module: c (c) (3/4)');
        expect(out).to.be.string('Finished module: d (d) (4/4)');
        expect(out).to.be.string('Finished module: d (d) (4/4)');

        // Should only start third module after first or second has finished (due to max. 2)
        expect(out.indexOf('Starting module: c (c) (3/4)')).to.be.above(out.indexOf('Finished module'));

        expect(out).to.be.string('a: echo aaa');
        expect(out).to.be.string('b: echo aaa');
        expect(out).to.be.string('c: echo aaa');
        expect(out).to.be.string('d: echo aaa');
      });
    });

    it('should show error if -p hides exec param', () => {
      fixtures.project().inDir(ctx => {
        expect(() => ctx.octo('exec -p "some command"')).to.throw('Not enough non-option arguments: got 0, need at least 1');
      });
    });
  });
});
