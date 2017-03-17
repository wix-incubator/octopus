const fixtures = require('./../support/fixtures'),
  expect = require('chai').expect,
  {aProject} = require('../test-utils');

describe('octo-run-script', function () {
  this.timeout(10000);

  it('should display help', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('help run-script');

      expect(out).to.be.string('Usage: octo run-script');
    });
  });

  it('should display help if no command is provided', () => {
    fixtures.project().inDir(ctx => {
      expect(() => ctx.octo('run-script')).to.throw('Usage: octo run-script');
    });
  });

  it('should be noop with message if no modules with changes present', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('run-script qwe.js');

      expect(out).to.be.string('no modules with changes found');
    });
  });

  it('should be noop with message if no modules present and --all is provided', () => {
    fixtures.project().inDir(ctx => {
      const out = ctx.octo('run-script qwe.js');

      expect(out).to.be.string('no modules with changes found');
    });
  });

  it('should exec command only to modules with changes by default', () => {
    aProject()
      .addFile('echo-script.js', 'console.log(`from script ${require(process.cwd()+ "/package.json").name}`);')
      .markBuilt()
      .inDir(ctx => {
        ctx.exec('sleep 2; touch c/touch');
        const out = ctx.octo('run-script -v ./echo-script.js');

        expect(out).to.be.string('Executing \'octo run-script \'./echo-script.js');
        expect(out).to.be.string('c (c) (1/1)');
        expect(out).to.not.be.string('a (a)');
        expect(out).to.not.be.string('b (b)');

        expect(out).to.be.string('from script c');
        expect(out).to.not.be.string('from script a');
        expect(out).to.not.be.string('from script b');

        expect(ctx.octo('exec "echo 1"')).to.not.be.string('c (c) (1/1)');
      });
  });

  it('should exec provided command and not mark module as built if -n is provided', () => {
    aProject()
      .addFile('echo-script.js', 'console.log(`from script ${require(process.cwd()+ "/package.json").name}`);')
      .inDir(ctx => {

        expect(ctx.octo('run-script -n ./echo-script.js')).to.be.string('c (c) (3/3)');
        expect(ctx.octo('run-script ./echo-script.js')).to.be.string('c (c) (3/3)');
      });
  });

  it('should exec command to all modules if --all is provided', () => {
    aProject()
      .addFile('echo-script.js', 'console.log(`from script ${require(process.cwd()+ "/package.json").name}`);')
      .markBuilt()
      .inDir(ctx => {
        const out = ctx.octo('run-script -av ./echo-script.js');

        expect(out).to.be.string('Executing \'octo run-script');
        expect(out).to.be.string('a (a) (1/3)');
        expect(out).to.be.string('b (b) (2/3)');
        expect(out).to.be.string('c (c) (3/3)');

        expect(out).to.be.string('from script a');
        expect(out).to.be.string('from script b');
        expect(out).to.be.string('from script c');
      });
  });
});
