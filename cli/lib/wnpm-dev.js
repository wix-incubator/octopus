const shelljs = require('shelljs'),
  path = require('path'),
  objectFilter = require('object-filter'),
  _ = require('lodash'),
  toposort = require('toposort'),
  gitignoreParser = require('ignore-file'),
  fs = require('fs');

const targetFileSentinelFilename = 'target/.bibuild-sentinel';

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

function sortPackagesByDependencies(packages) {
  const dependencyEdges = createDependencyEdgesFromPackages(packages);
  var executionList = toposort.array(_.map(packages, el => el.relativePath), dependencyEdges).reverse();
  return executionList.map(packageRelativePath => _.find(packages, p => p.relativePath === packageRelativePath));
}

function findChangedPackages(dir, packages) {
  return inDir(dir, () => packages.filter(p => isPackageChanged(p)))
}

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

function makePackageBuilt(dir) {
  shelljs.mkdir('-p', path.resolve(dir, path.dirname(targetFileSentinelFilename)));
  shelljs.echo('').to(path.resolve(dir, targetFileSentinelFilename));
}

function makePackageUnbuilt(dir) {
  shelljs.rm('-f', path.resolve(dir, targetFileSentinelFilename));
}

function makePackagesUnbuilt(dirs) {
  dirs.forEach(makePackageUnbuilt);
}

function isPackageChanged(packageObject) {
  const fullPath = packageObject.fullPath;
  const ignored = gitignoreParser.compile(collectIgnores(fullPath, []));
  const targetSentinelForPackage = path.resolve(fullPath, targetFileSentinelFilename);
  return !shelljs.test('-f', targetSentinelForPackage) ||
    findLastModifiedTimeOfPackageSources(packageObject.relativePath, ignored) >
    fs.statSync(targetSentinelForPackage).mtime.getTime();
}

function findLastModifiedTimeOfPackageSources(dir, ignored) {
  const entries = shelljs.ls(dir);

  return entries.map(entry => path.join(dir, entry)).filter(entry => !ignored(entry)).map(entry =>
    shelljs.test('-d', entry) ?
      findLastModifiedTimeOfPackageSources(entry, ignored) :
      fs.statSync(entry).mtime.getTime()).reduce((acc, entryTime) => Math.max(acc, entryTime), 0)
}

function isNodeModulesDir(dir) {
  return dir === 'node_modules';
}

function findListOfPackagesAndLocalDependencies(baseDir, workDir, depth) {
  const buildFile = 'package.json';
  workDir = path.resolve(workDir);
  depth = depth || 0;
  return inDir(workDir, function () {
    const entriesInBaseDir = shelljs.ls() || [];

    const packagesHierarchy = entriesInBaseDir.filter(function (entry) {
      return shelljs.test('-d', entry);
    }).map(function (dir) {
      if (!isAnNpmProject(dir) && !isNodeModulesDir(dir)) {
        return findListOfPackagesAndLocalDependencies(baseDir, dir, anNpmPackageObjectFrom, depth + 1);
      }
      else if (shelljs.test('-f', path.resolve(dir, buildFile))) {
        return anNpmPackageObjectFrom(dir, path.resolve(dir), path.relative(baseDir, dir));
      } else {
        return undefined;
      }
    });

    //TODO: make it nicer - now handling as special case
    if (shelljs.test('-f', path.resolve(baseDir, buildFile))) {
      packagesHierarchy.push(anNpmPackageObjectFrom(baseDir, path.resolve(baseDir), path.relative(baseDir, baseDir)))
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
  return Object.keys(packageToBuild.npm.dependencies).map(name => allPackagesByName[name].fullPath);
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


function collectIgnores(dir, acc) {
  acc = acc || ['target', 'node_modules', 'npm-debug.log'];
  return _.union(acc, inDir(dir, () => {
    const slash = path.sep;
    const ignores = readAndParseGitignore();
    const parent = dir.split(slash).slice(0, -1).join(slash) || '/';
    const isRoot = shelljs.test('-d', '.git');
    return isRoot || dir === slash ? ignores : collectIgnores(parent, ignores);
  }));
}

function readAndParseGitignore() {
  const gitignore = shelljs.test('-f', '.gitignore');
  return gitignore
    ? fs.readFileSync('.gitignore', 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.charAt(0) !== '#')
    : [];
}

function createObjectFromArrayOfObjects(arrayOfObjects, keyInReturnedObject) {
  const ret = {};

  for (let obj of arrayOfObjects) {
    ret[_.get(obj, keyInReturnedObject)] = obj;
  }

  return ret;
}

function inDir(dir, f) {
  const originalDir = process.cwd();
  process.chdir(dir);
  try {
    return f();
  }
  finally {
    process.chdir(originalDir);
  }
}

function isAnNpmProject(dir) {
  return shelljs.test('-f', path.resolve(dir, 'package.json'));
}