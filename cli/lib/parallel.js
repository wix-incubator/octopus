const getMachineCores = require('os').cpus;

const removeFromArray = (array, elem) => array.splice(array.indexOf(elem), 1);

module.exports = (modules, asyncAction) => {
  const runnableModules = [];
  const notYetRunnableModules = [];

  const allModulesNames = modules.map(module => module.fullPath);
  const completedModulesNames = [];

  const isDepBuilt = dep => !allModulesNames.includes(dep) || completedModulesNames.includes(dep);

  modules.forEach(module => {
    const relevantDeps = module.links().filter(dep => allModulesNames.includes(dep));
    if (relevantDeps.length === 0) {
      runnableModules.push(module);
    } else {
      notYetRunnableModules.push(module);
    }
  });

  const maxConcurrent = getMachineCores().length;
  let currentConcurrent = 0;

  const handleModuleAsync = module => module.inDir(() => {
    if (currentConcurrent >= maxConcurrent) {
      return;
    }

    currentConcurrent++;
    removeFromArray(runnableModules, module);

    asyncAction(module).then(() => {
      currentConcurrent--;
      completedModulesNames.push(module.fullPath);

      notYetRunnableModules.slice().forEach(waitingModule => {
        const readyToBuild = waitingModule.links().every(isDepBuilt);

        if (readyToBuild) {
          removeFromArray(notYetRunnableModules, waitingModule);
          runnableModules.push(waitingModule);
        }
      });

      runnableModules.slice().forEach(handleModuleAsync);
    }).catch(error => {
      log.error(`Encountered an error while running on module ${module.fullPath}`);
      log.error(error.message);
      process.exit(1);
    });
  });

  runnableModules.slice().forEach(handleModuleAsync);
};