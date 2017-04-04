const devSupport = require('./lib/wnpm-dev'),
  asModule = require('./lib/module');

module.exports.modules = (rootDir = process.cwd()) => {
  const allPackagesToBuild = devSupport.findListOfNpmPackagesAndLocalDependencies(rootDir);
  const sortedPackagesToBuild = devSupport.sortPackagesByDependencies(allPackagesToBuild);

  // const allPackagesToBuild = devSupport.findListOfNpmPackagesAndLocalDependencies(dir);
  // const changedPackages = devSupport.findChangedPackages(dir, allPackagesToBuild);
  // const sortedPackagesToBuild = devSupport.sortPackagesByDependencies(allPackagesToBuild);
  // const needsRebuild = toPackagePaths(devSupport.figureOutAllPackagesThatNeedToBeBuilt(allPackagesToBuild, changedPackages));

  return sortedPackagesToBuild.map(pkg => {
    const dependencies = devSupport.npmLinks(pkg, allPackagesToBuild);
    return asModule({pkg, dependencies});
  });
};