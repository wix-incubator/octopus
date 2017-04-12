const devSupport = require('./lib/wnpm-dev'),
  asModule = require('./lib/module');

module.exports.modules = (rootDir = process.cwd()) => {
  const allPackagesToBuild = devSupport.findListOfNpmPackagesAndLocalDependencies(rootDir);
  const sortedPackagesToBuild = devSupport.sortPackagesByDependencies(allPackagesToBuild);

  return sortedPackagesToBuild.map(pkg => {
    const dependencies = devSupport.npmLinks(pkg, allPackagesToBuild);
    return asModule({pkg, dependencies});
  });
};

module.exports.removeUnchanged = modules => {
  const changedPackages = devSupport.findChangedPackages(process.cwd(), modules);
  return devSupport.figureOutAllPackagesThatNeedToBeBuilt(modules, changedPackages);
};