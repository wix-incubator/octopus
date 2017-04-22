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

module.exports.removeNotInPaths = (modules, paths) => {
  const changedPackages = modules.filter(module => {
    return paths.find(file => file.startsWith(module.relativePath + '/'))
  });
  return figureOutAllPackagesThatNeedToBeBuilt(modules, changedPackages);
};

module.exports.removeUnchanged = (modules, label = 'default') => {
  const changedPackages = devSupport.findChangedPackages(process.cwd(), modules, label);
  const allPackages = figureOutAllPackagesThatNeedToBeBuilt(modules, changedPackages);
  return allPackages;
  //return devSupport.sortPackagesByDependencies(allPackages);
};

module.exports.markBuilt = (label = 'default') => module => {
  return makePackageBuilt(module.path, label);
};

module.exports.markUnbuilt = (label = 'default') => module => {
  return makePackageUnbuilt(module.path, label);
};

function figureOutAllPackagesThatNeedToBeBuilt(allPackages, changedPackages) {
  const transitiveClosureOfPackagesToBuild = new Set(changedPackages.map(el => el.relativePath));
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
  const setOfAllPackageNames = new Set(packages.map(p => p.relativePath));
  const packagesByNpmName = _.keyBy(packages, 'relativePath');

  const dependencyEdges = [];
  packages.forEach(packageObject => {
    (packageObject.dependencies || []).forEach(({relativePath}) => {
      if (setOfAllPackageNames.has(relativePath)) {
        dependencyEdges.push([packageObject.relativePath, packagesByNpmName[relativePath].relativePath])
      }
    });
  });

  return dependencyEdges;
}
