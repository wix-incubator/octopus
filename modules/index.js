const devSupport = require('./lib/wnpm-dev'),
  asModule = require('./lib/module'),
  {makePackageBuilt, makePackageUnbuilt} = require('./lib/detect-changes'),
  _ = require('lodash');

module.exports.modules = () => {
  const allPackagesToBuild = devSupport.findListOfNpmPackagesAndLocalDependencies(process.cwd());
  const sortedPackagesToBuild = devSupport.sortPackagesByDependencies(allPackagesToBuild);

  return sortedPackagesToBuild.map(pkg => {
    const dependencies = devSupport.npmLinks(pkg, allPackagesToBuild);
    return asModule({pkg, dependencies});
  });
};

module.exports.removeUnchanged = (modules, paths) => {
  if (paths) {
    const changedPackages = modules.filter(module => {
      return paths.find(file => file.startsWith(module.relativePath + '/'))
    });
    return figureOutAllPackagesThatNeedToBeBuilt(modules, changedPackages);
  } else {
    const changedPackages = devSupport.findChangedPackages(process.cwd(), modules);
    return figureOutAllPackagesThatNeedToBeBuilt(modules, changedPackages);
  }
};

module.exports.markBuilt = module => {
  return makePackageBuilt(module.path);
};

module.exports.markUnbuilt = module => {
  return makePackageUnbuilt(module.path);
};

function figureOutAllPackagesThatNeedToBeBuilt(allPackages, changedPackages) {
  const transitiveClosureOfPackagesToBuild = new Set(_.map(changedPackages, el => el.relativePath));
  let dependencyEdges = createDependencyEdgesFromPackages(allPackages);

  let dependencyEdgesLengthBeforeFiltering = dependencyEdges.length;
  do {
    dependencyEdgesLengthBeforeFiltering = dependencyEdges.length;

    const newDependencyEdges = [];

    for (let edge of dependencyEdges) {
      if (transitiveClosureOfPackagesToBuild.has(edge[1])) {
        transitiveClosureOfPackagesToBuild.add(edge[0]);
      } else {
        newDependencyEdges.push(edge);
      }
    }
    dependencyEdges = newDependencyEdges;

  } while (dependencyEdgesLengthBeforeFiltering !== dependencyEdges.length);

  return allPackages.filter(p => transitiveClosureOfPackagesToBuild.has(p.relativePath));
}

function createDependencyEdgesFromPackages(packages) {
  const setOfAllPackageNames = new Set(_.flatten(packages.map(packageNames)));
  const packagesByNpmName = _.keyBy(packages.filter(p => p.npm), 'npm.name');

  const dependencyEdges = [];
  for (let packageObject of packages) {

    for (let dep of packageObject.npm ? Object.keys(packageObject.npm.dependencies) : []) {
      if (setOfAllPackageNames.has(dep)) {
        dependencyEdges.push([packageObject.relativePath, packagesByNpmName[dep].relativePath])
      }
    }
  }

  return dependencyEdges;
}
