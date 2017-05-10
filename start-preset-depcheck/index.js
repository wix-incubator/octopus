const {iter, modules} = require('octopus-start-modules-tasks'),
  start = require('start').default,
  depcheck = require('depcheck');

function depcheckTask(depcheckOpts = {}) {
  return () => function depCheck(log, reporter) {
    return start(reporter)(
      modules.load(),
      iter.async()(item => {
        return Promise.resolve().then(() => depcheck(item.path, depcheckOpts, ({dependencies, devDependencies}) => {
          const unusedDeps = devDependencies.concat(dependencies);
          if (unusedDeps.length > 0) {
            return Promise.reject(new Error(`module ${item.name} has unused dependencies: ${unusedDeps.join(', ')}`));
          } else {
            return Promise.resolve();
          }
        }))
      })
    )
  }
}

module.exports = depcheckTask;