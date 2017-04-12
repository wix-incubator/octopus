const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  {join} = require('path'),
  _ = require('lodash'),
  deepKeys = require('deep-keys'),
  deepEqual = require('deep-equal');

module.exports.readJson = module => fileName => () => {
  return function readJson(/*log, reporter*/) {
    return readJsonFile(module.path, fileName);
  }
};

module.exports.mergeJson = onMerge => overrides => mergeTo => {
  return function mergeJson(/*log, reporter*/) {
    return Promise.resolve()
      .then(() => merge(mergeTo, overrides, onMerge));
  }
};

module.exports.writeJson = module => fileName => json => {
  return function writeJson(/*log, reporter*/) {
    return readJsonFile(module.path, fileName)
      .catch(() => Promise.resolve())
      .then(existingJsonOrUndefined => {
        if (!existingJsonOrUndefined || (existingJsonOrUndefined && !isDeepEqual(existingJsonOrUndefined, json))) {
          const jsonToWrite = JSON.stringify(json, null, 2);
          return fs.writeFileAsync(join(module.path, fileName), jsonToWrite).then(() => json);
        } else {
          return json;
        }
      });
  }
};

function merge(dest, source, onMerged = _.noop) {
  const destKeys = deepKeys(dest);
  const sourceKeys = deepKeys(source);
  const sharedKeys = _.intersection(destKeys, sourceKeys);

  sharedKeys.forEach(key => {
    const currentValue = _.get(dest, key);
    const newValue = _.get(source, key);
    if (currentValue !== newValue) {
      _.set(dest, key, newValue);
      onMerged({key, currentValue, newValue});
    }
  });

  return dest;
}

function readJsonFile(path, name) {
  return fs.readFileAsync(join(path, name))
    .then(JSON.parse);
}

function isDeepEqual(first, second) {
  try {
    return deepEqual(first, second);
  } catch (e) {
    return false;
  }
}