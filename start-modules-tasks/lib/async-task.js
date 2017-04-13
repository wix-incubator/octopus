const Promise = require('bluebird');

const DEFAULTS = {
  mapInput: input => input,
  silent: false,
  threads: 4
};

module.exports = ({mapInput = DEFAULTS.mapInput, silent = DEFAULTS.silent, threads = DEFAULTS.threads} = DEFAULTS) => asyncAction => taskInput => {

  const modules = mapInput(taskInput);
  const runnableModules = [];
  const notYetRunnableModules = [];
  const runningModules = [];

  const allModulesNames = modules.map(module => module.name);
  const completedModulesNames = [];

  const isDepBuilt = dep => !allModulesNames.includes(dep) || completedModulesNames.includes(dep);

  modules.forEach(module => {
    if (canRun(module, allModulesNames)) {
      runnableModules.push(module);
    } else {
      notYetRunnableModules.push(module);
    }
  });

  let threadCount = 0;

  return function asyncModules(log, reporter) {
    return new Promise((resolve, reject) => {
      const handleModuleAsync = module => {
        if (threadCount >= threads) {
          return;
        }

        if (!canRun(module, completedModulesNames)) {
          return;
        }

        threadCount++;
        removeFromArray(runnableModules, module);
        runningModules.push(module);

        const taskReporter = collectingReporter(reporter);
        //TODO: test silent
        if (!silent) {
          taskReporter.reporter('asyncModules', 'info', `${module.name} (${module.relativePath}) (${completedModulesNames.length + 1}/${modules.length})`);
        }

        return asyncAction(module, taskInput, taskReporter.reporter).then(() => {
          taskReporter.flush();
          removeFromArray(runningModules, module);
          if (notYetRunnableModules.length === 0 && runnableModules.length === 0) {
            resolve();
          }

          threadCount--;
          completedModulesNames.push(module.name);

          notYetRunnableModules.slice().forEach(waitingModule => {
            const readyToBuild = linkNames(waitingModule).every(isDepBuilt);

            if (readyToBuild) {
              removeFromArray(notYetRunnableModules, waitingModule);
              runnableModules.push(waitingModule);
            }
          });

          runnableModules.slice().forEach(handleModuleAsync);
        }).catch(error => {
          taskReporter.flush();
          reject(error);
        });
      };

      runnableModules.slice().forEach(handleModuleAsync);
    });
  };
};

function linkNames(module) {
  return module.dependencies.map(el => el.name);
}

function canRun(module, completedModuleNames) {
  const relevantDeps = linkNames(module)
    .filter(dep => !completedModuleNames.includes(dep));

  return relevantDeps.length === 0;
}

function removeFromArray(array, elem) {
  return array.splice(array.indexOf(elem), 1);
}

//TODO: test reporter
function collectingReporter(reporter) {
  const collectedItems = [];

  return {
    reporter: (...args) => collectedItems.push(args),
    flush: () => collectedItems.forEach(args => reporter(...args))
  }
}