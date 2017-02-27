const log = require('./logger')();

// Initial idea was to set max threads to number of machine cores.
// This turned out to be quite to much. For now using const 4.
// const defaultMaxThreads = getMachineCores().length;
// const getMachineCores = require('os').cpus,

const defaultMaxThreads = 4;

const removeFromArray = (array, elem) => array.splice(array.indexOf(elem), 1);

module.exports = (modules, asyncAction, maximumThreads = defaultMaxThreads) => {
  const runnableModules = [];
  const notYetRunnableModules = [];

  const allModulesNames = modules.map(module => module.npm.name);
  const completedModulesNames = [];

  const isDepBuilt = dep => !allModulesNames.includes(dep) || completedModulesNames.includes(dep);

  modules.forEach(module => {
    const relevantDeps = Object.keys(module.npm.dependencies).filter(dep => allModulesNames.includes(dep));
    if (relevantDeps.length === 0) {
      runnableModules.push(module);
    } else {
      notYetRunnableModules.push(module);
    }
  });

  let threadCount = 0;

  return new Promise((resolve, reject) => {
    const handleModuleAsync = module => {
      if (threadCount >= maximumThreads) {
        return;
      }

      threadCount++;
      removeFromArray(runnableModules, module);

      asyncAction(module).then(() => {
        if(notYetRunnableModules.length === 0) {
          resolve();
        }

        threadCount--;
        completedModulesNames.push(module.npm.name);

        notYetRunnableModules.slice().forEach(waitingModule => {
          const readyToBuild = waitingModule.links().every(isDepBuilt);

          if (readyToBuild) {
            removeFromArray(notYetRunnableModules, waitingModule);
            runnableModules.push(waitingModule);
          }
        });

        runnableModules.slice().forEach(handleModuleAsync);
      }).catch(error => {
        log.error(`Encountered an error while running on module ${module.npm.name}`);
        log.error(error.message);
        reject(error);
      });
    };

    runnableModules.slice().forEach(handleModuleAsync);
  });
};
