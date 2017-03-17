#!/usr/bin/env node
const log = require('../../lib/logger')(),
  parallel = require('../../lib/parallel'),
  forCommand = require('../../lib/commands').forCommand,
  assert = require('../../lib/asserts'),
  join = require('path').join;

exports.command = 'run-script';
exports.desc = 'execute arbitrary script for modules';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo run-script [options] ./script.js')
    .demand(1)
    .option('a', {
      alias: 'all',
      describe: 'execute for all modules',
      type: 'boolean'
    })
    .option('n', {
      alias: 'no-build',
      describe: 'do not mark modules as built',
      type: 'boolean'
    })
    .option('v', {
      alias: 'verbose',
      describe: 'verbose output',
      type: 'boolean'
    })
    .option('p', {
      alias: 'parallel',
      describe: 'run in parallel',
      type: 'number',
      default: -1
    })
    .example('octo run-script ./scripts/woop.js');
};

exports.handler = forCommand(opts => `octo run-script '${opts._.slice(1).join()}'`, (octo, config, opts) => {
  assert.assertValidParallelOption(opts, log);

  const forAll = opts.all;
  const cmd = 'node ' + join(octo.cwd, opts._.slice(1).join());

  const parallel = opts.parallel !== -1;

  const modules = octo.modules.filter(module => forAll ? module : module.needsRebuild());
  const count = modules.length;

  if (count === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
    return;
  }


  if (parallel) {
    handleParallel(modules, cmd, opts).catch(() => process.exit(1));
  } else {
    handleSync(modules, cmd, opts);
  }
});

const handleSync = (modules, cmd, opts) => {
  modules.forEach((module, i) =>
    log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${modules.length})`, () => {
      module.exec(cmd, opts.verbose);

      if (!opts.noBuild) {
        module.markBuilt();
      }
    })
  );
};

const handleParallel = (modules, cmd, opts) => {
  let i = 0;

  const action = module => {
    const name = `${module.npm.name} (${module.relativePath}) (${++i}/${modules.length})`;
    log.info(`Starting module: ${name}`);

    log.info(` ${module.npm.name}: ${cmd}`);
    let action = module.execAsync(cmd, module.fullPath);

    return action.then(({stdout, stderr}) => {
      if (opts.verbose) {
        log.info(`Finished module: ${name} with stdout: \n${stdout}\n and stderr: \n${stderr}`);
      } else {
        log.info(`Finished module: ${name}`);
      }

      if (!opts.noBuild) {
        module.markBuilt();
      }
    });
  };

  return parallel(modules, action, opts.parallel);
};
