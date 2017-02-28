#!/usr/bin/env node
const log = require('../../lib/logger')(),
  forCommand = require('../../lib/commands').forCommand,
  engines = require('../../lib/engines'),
  parallel = require('../../lib/parallel'),
  assert = require('../../lib/asserts');

exports.command = 'bootstrap';
exports.desc = 'npm install and link all modules';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo bootstrap [options]')
    .option('a', {
      alias: 'all',
      describe: 'execute for all modules regardless of current build status',
      type: 'boolean'
    })
    .option('n', {
      alias: 'no-build',
      describe: 'do not mark modules as built',
      type: 'boolean'
    })
    .option('c', {
      alias: 'clean',
      describe: 'execute octopus.json clean script before bootstrapping each module',
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
    });
};

exports.handler = forCommand('octo bootstrap', (octo, config, opts) => {
  assert.assertValidParallelOption(opts, log);

  const engine = engines(config);
  const forAll = opts.all;
  const clean = opts.clean;
  const parallel = opts.parallel !== -1;

  if (forAll) {
    log.warn('marking modules with changes as unbuilt');
    octo.modules.forEach(module => module.markUnbuilt());
  }

  const modules = octo.modules.filter(module => forAll === true ? module : module.needsRebuild());

  if (modules.length === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
    return;
  }

  let cleanScript;
  if (clean) {
    if (config.scripts && config.scripts.clean) {
      cleanScript = config.scripts.clean;
    } else {
      log.warn('-c provided, but no scripts.clean present in octopus.json - ignoring');
    }
  }

  if (parallel) {
    handleParallel(engine, modules, cleanScript, opts).catch(() => process.exit(1));
  } else {
    handleSync(engine, modules, cleanScript, opts);
  }
});

const handleSync = (engine, modules, cleanScript, opts) => {
  modules.forEach((module, i) => module.inDir(() => {
    log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${modules.length})`, () => {
      if (cleanScript) {
        log.warn(`Running clean script with command: "${cleanScript}"`);
        module.exec(cleanScript, opts.verbose);
      }

      const cmd = engine.bootstrap(module);
      log.for(`install/link (${cmd})`, () => {
        module.exec(cmd, opts.verbose);
        if (!opts.noBuild) {
          module.markBuilt();
        }
      });
    });
  }));
};

const handleParallel = (engine, modules, cleanScript, opts) => {
  let i = 0;

  const bootstrapModule = module => {
    const cmd = engine.bootstrap(module);
    log.info(` ${module.npm.name}: Running install/link (${cmd})`);

    return module.execAsync(cmd, module.fullPath);
  };

  const action = module => {
    const name = `${module.npm.name} (${module.relativePath}) (${++i}/${modules.length})`;
    log.info(`Starting module: ${name}`);

    let action;

    if (cleanScript) {
      log.warn(` ${module.npm.name}: Running clean script: "${cleanScript}"`);
      action = module.execAsync(cleanScript, module.fullPath).then(() => bootstrapModule(module));
    } else {
      action = bootstrapModule(module);
    }

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
