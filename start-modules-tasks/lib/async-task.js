const DEFAULTS = {
  mapInput: input => input,
  silent: false,
  threads: 4
};

module.exports = ({mapInput = DEFAULTS.mapInput, threads = DEFAULTS.threads} = DEFAULTS) => asyncAction => taskInput => {

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

  return function forEachModules(log, reporter) {
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

        asyncAction(module, taskInput, reporter).then(() => {
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
