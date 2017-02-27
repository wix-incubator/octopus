#!/usr/bin/env node
const log = require('../../lib/logger')(),
  forCommand = require('../../lib/commands').forCommand,
  parallel = require('../../lib/parallel'),
  engines = require('../../lib/engines');

exports.command = 'run';
exports.desc = 'runs npm scripts for modules with changes';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo run [options] <script> [otherScripts...]')
    .demand(1)
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
    .option('v', {
      alias: 'verbose',
      describe: 'verbose output',
      type: 'boolean'
    })
    .option('p', {
      alias: 'parallel',
      describe: 'run in parallel',
      type: 'boolean'
    });
};

exports.handler = forCommand(opts => `octo run ${opts._.slice(1).join(' ')}`, (octo, config, opts) => {
  const engine = engines(config);
  const forAll = opts.all;
  const scripts = opts._.slice(1);
  const parallel = opts.parallel;

  if (forAll) {
    log.warn('marking modules with changes as unbuilt');
    octo.modules.forEach(module => module.markUnbuilt());
  }
  
  const modules = octo.modules.filter(module => forAll === true ? module : module.needsRebuild());
  //TODO: so would continue after failure. Test this.
  modules.forEach(module => module.markUnbuilt());

  if (modules.length === 0) {
    log.warn(forAll ? 'no modules found' : 'no modules with changes found');
    return;
  }

  const commands = scripts.map(script => {
    return { name: script, cmd: engine.run(script)}
  });

  if (parallel) {
    handleParallel(modules, commands, opts).catch(() => process.exit(1));
  } else {
    handleSync(modules, commands, opts);
  }
});

const handleSync = (modules, commands, opts) => {
  modules.forEach((module, i) => module.inDir(() => {
    log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${modules.length})`, () => {
      commands.forEach(el => {
        log.for(` ${el.name} (${el.cmd})`, () => {
          module.exec(el.cmd, opts.verbose);
        });
      });
      if (!opts.noBuild) {
        module.markBuilt();
      }
    });
  }));
};

const handleParallel = (modules, commands, opts) => {
  let i = 0;

  const action = module => {
    const name = `${module.npm.name} (${module.relativePath}) (${++i}/${modules.length})`;
    log.info(`Starting module: ${name}`);

    let action = Promise.resolve();

    commands.forEach(el => {
      action = action.then(() => {
        log.info(` ${module.npm.name}: ${el.name} (${el.cmd})`);
        let commandAction = module.execAsync(el.cmd, module.fullPath);

        if (opts.verbose) {
          commandAction = commandAction.then(({stdout, stderr}) =>
            log.info(`  ${module.npm.name}: ${el.name} finished with stdout: \n${stdout}\n and stderr: \n${stderr}`));
        }

        return commandAction;
      });
    });

    return action.then(() => {
      log.info(`Finished module: ${name}`);

      if (!opts.noBuild) {
        module.markBuilt();
      }
    });
  };

  return parallel(modules, action);
};
