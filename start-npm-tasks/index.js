const moduleTasks = require('octopus-start-modules-tasks');

// function checkModule(item, depcheckOpts) {
//   return () => () => Promise.resolve()
//     .then(() => depcheck(item.path, depcheckOpts, val => val))
//     .then(({dependencies, devDependencies}) => {
//       const unusedDeps = devDependencies.concat(dependencies);
//       if (unusedDeps.length > 0) {
//         return Promise.reject(new Error(`module ${item.name} has unused dependencies: ${unusedDeps.join(', ')}`));
//       } else {
//         return Promise.resolve();
//       }
//     });
// }

function npmRunTask(module) {
  return scriptName => () => function npmRun(log, reporter) {
    return moduleTasks.module.readJson(module)('package.json')()(log, reporter)
      .then(({scripts}) => {
        if (scripts[scriptName]) {
          return moduleTasks.module.exec(module)(`npm run ${scriptName}`)()(log, reporter);
        } else {
          log(`script ${scriptName} not found, skipping...`);
          return Promise.resolve();
        }
      });
  }
}

module.exports.run = npmRunTask;
