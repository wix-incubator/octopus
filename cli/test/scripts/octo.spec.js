const empty = require('./../support/fixtures').empty,
  expect = require('chai').expect,
  packageJson = require('../../package.json'),
  os = require('os');

describe('octo', function() {
  this.timeout(10000);


  it('should print usage with custom help for --help', () => {
    empty().inDir(ctx => {
      const out = ctx.octo('--help');

      expect(out).to.be.string('Usage: octo <command> [options]');
      expect(out).to.be.string('|(@)(@)|');
    });
  });

  it('should display help if no command is provided', () => {
    empty().inDir(ctx =>
      expect(() => ctx.octo()).to.throw('Usage: octo <command> [options]')
    );
  });

  it('should display help if non-existent command is provided', () => {
    empty().inDir(ctx =>
      expect(() => ctx.octo('qweqweqwe')).to.throw('Unknown argument')
    );
  });

  it('should display help if non-existent command is provided', () => {
    empty().inDir(ctx =>
      expect(() => ctx.octo('qwe')).to.throw('Did you mean')
    );
  });

  it('should print version from package.json', () => {
    empty().inDir(ctx => {
      const out = ctx.octo('-V');

      expect(out).to.be.string(packageJson.version);
    });
  });

  it('should print usage and proper error if octopus.json not found', done => {
    empty(os.tmpdir()).inDir(ctx => {
      try {
        ctx.octo('bootstrap');
        done(new Error('expected to fail'));
      } catch (e) {
        expect(e.output).to.be.string('Must execute either in project root (octopus.json) or sub-folder of project');
        done();
      }
    });
  });

  it.skip('should allow execution from sub-folder of project');

});
