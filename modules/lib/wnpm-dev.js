const shelljs = require('shelljs'),
  path = require('path'),
  objectFilter = require('object-filter'),
  _ = require('lodash'),
  fs = require('fs'),
  {dag, toposort, startingFrom} = require('./graph'),
  {makePackageBuilt, makePackagesUnbuilt, findChangedPackages} = require('./detect-changes'),
  inDir = require('./in-dir').sync;

exports.findListOfNpmPackagesAndLocalDependencies = findListOfNpmPackagesAndLocalDependencies;
exports.sortPackagesByDependencies = sortPackagesByDependencies;
exports.findChangedPackages = findChangedPackages;
exports.figureOutAllPackagesThatNeedToBeBuilt = figureOutAllPackagesThatNeedToBeBuilt;

exports.makePackagesUnbuilt = makePackagesUnbuilt;
exports.makePackageBuilt = makePackageBuilt;
exports.npmLinks = npmLinks;

function findListOfNpmPackagesAndLocalDependencies(baseDir) {
  return findListOfPackagesAndLocalDependencies(path.resolve(baseDir), baseDir)
}

exports.prepareBuildOrder = function (packages, resumeFrom) {
  const filteredPackages = resumeFrom ? applyGraphFnToPackages(startingFrom, packages, resumeFrom) : packages;
  return {
    order: applyGraphFnToPackages(toposort, filteredPackages),
    graph: dag(createDependencyEdgesFromPackages(filteredPackages), filteredPackages, aPackage => aPackage.relativePath)
  }
};

function applyGraphFnToPackages(fn, packages, ...args) {
  const dependencyEdges = createDependencyEdgesFromPackages(packages);
  let res = fn.apply(null, [dependencyEdges, packages, aPackage => aPackage.relativePath].concat(args));

  return res.filter(_.isObject);
}

exports.figureOutPackagesDependingOn = function (packages, onlyDependingOn) {
  return applyGraphFnToPackages(startingFrom, packages, onlyDependingOn);
};

function sortPackagesByDependencies(packages) {
  return applyGraphFnToPackages(toposort, packages);
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

function findListOfPackagesAndLocalDependencies(baseDir, workDir, depth) {
  workDir = path.resolve(workDir);
  depth = depth || 0;
  return inDir(workDir, function () {
    let packagesHierarchy = [];

    if (isAnNpmPrivateProject(workDir) || !isAnNpmProject(workDir)) {
      const entriesInBaseDir = shelljs.ls() || [];

      packagesHierarchy = entriesInBaseDir
        .filter(entry => shelljs.test('-d', entry))
        .map(function (dir) {
          if (!isAnNpmProject(dir) || isAnNpmPrivateProject(dir)) {
            return findListOfPackagesAndLocalDependencies(baseDir, dir, anNpmPackageObjectFrom, depth + 1);
          }
          else if (isAnNpmProject(dir)) {
            return anNpmPackageObjectFrom(dir, path.resolve(dir), path.relative(baseDir, dir));
          } else {
            return undefined;
          }
        });
    } else if (isAnNpmProject(baseDir)) {
      packagesHierarchy.push([anNpmPackageObjectFrom(baseDir, path.resolve(baseDir), path.relative(baseDir, baseDir))]);
    }

    const packages = _.without(_.flattenDeep(packagesHierarchy), undefined);

    if (depth === 0) {
      return removeNonLocalDependenciesFrom(packages, 'npm');
    } else {
      return packages;
    }

  });
}

function npmLinks(packageToBuild, allPackages) {
  const allPackagesByName = createObjectFromArrayOfObjects(allPackages, 'npm.name');
  return Object.keys(packageToBuild.npm.dependencies).map(name => {
    return {
      name,
      version: allPackagesByName[name].npm.version,
      path: allPackagesByName[name].fullPath,
      relativePath: allPackagesByName[name].relativePath
    }
  });
}

function packageNames(packageObj) {
  return [].concat(packageObj.npm ? packageObj.npm.name : []);
}

function anNpmPackageObjectFrom(npmDir, fullPathToNpmDir, relativePath) {
  let config = {};
  let packageJson = {};

  try {
    packageJson = JSON.parse(shelljs.cat(path.resolve(fullPathToNpmDir, 'package.json')));
  } catch (e) {
    throw new Error(`Problem parsing package.json in package ${relativePath}: ${e.message}`);
  }

  try {
    const pathBibuildrc = path.resolve(fullPathToNpmDir, '.bibuildrc');
    const isBibuildrcExists = fs.existsSync(pathBibuildrc);

    if (isBibuildrcExists) {
      config = JSON.parse(shelljs.cat(pathBibuildrc));
    }
  } catch (e) {
    throw new Error(`Problem parsing .bibuildrc in package ${relativePath}: ${e.message}`);
  }

  return {
    dir: npmDir,
    fullPath: fullPathToNpmDir,
    relativePath: relativePath,
    npm: {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: _.assign({},
        packageJson.dependencies, packageJson.devDependencies, packageJson.peerDependencies),
      isRunnable: !!packageJson.scripts && !!packageJson.scripts.start,
      isPrivate: packageJson.private,
      config: config
    }
  }
}

function removeNonLocalDependenciesFrom(packages, packageType) {
  const packagesByName = createObjectFromArrayOfObjects(packages, packageType + '.name');

  return _.values(
    _.mapValues(packagesByName, function (aPackage) {
      return _.assign({}, aPackage,
        createDependenciesObjectFromDependencies(packageType, _.assign({}, aPackage[packageType], {
          dependencies: objectFilter(aPackage[packageType].dependencies || [], function (dep, depName) {
            return packagesByName.hasOwnProperty(depName)
          })
        })))
    }));
}

function createDependenciesObjectFromDependencies(packageType, deps) {
  const ret = {};
  ret[packageType] = deps;
  return ret;
}

function createObjectFromArrayOfObjects(arrayOfObjects, keyInReturnedObject) {
  const ret = {};

  for (let obj of arrayOfObjects) {
    ret[_.get(obj, keyInReturnedObject)] = obj;
  }

  return ret;
}

function isAnNpmProject(dir) {
  return shelljs.test('-f', path.resolve(dir, 'package.json'));
}

function isAnNpmPrivateProject(dir) {
  return isAnNpmProject(dir) && JSON.parse(shelljs.cat(path.resolve(dir, 'package.json'))).private;
}
