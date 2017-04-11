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

//TODO: print what has changed
module.exports.mergeJson = cb => overrides => mergeTo => {
  return function mergeJson(log/*, reporter*/) {
    const onMerge = cb || _.noop;
    return Promise.resolve()
      .then(() => merge(mergeTo, overrides, onMerge));
  }
};

//TODO: check if changed
module.exports.writeJson = module => fileName => json => {
  return function writeJson(/*log, reporter*/) {
    return readJsonFile(module.path, fileName)
      .catch(() => Promise.resolve())
      .then(existingJsonOrUndefined => {
        if (!existingJsonOrUndefined || (existingJsonOrUndefined && !isDeepEqual(existingJsonOrUndefined, json))) {
          const jsonToWrite = JSON.stringify(json, null, 2);
          return fs.writeFileSync(join(module.path, fileName), jsonToWrite);
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
    _.set(dest, key, newValue);
    onMerged({key, currentValue, newValue});
  });

  return dest;
}

function readJsonFile(path, name) {
  return fs.readFileAsync(join(path, name))
    .then(JSON.parse);
}

function isDeepEqual(first, second) {
  try {
    deepEqual(first, second);
    return true;
  } catch(e) {
    return false;
  }
}