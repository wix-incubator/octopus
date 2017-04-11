const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  {join} = require('path'),
  _ = require('lodash'),
  deepKeys = require('deep-keys');

module.exports.readJson = module => fileName => () => {
  return function readJson() {
    return fs.readFileAsync(join(module.path, fileName))
      .then(JSON.parse);
  }
};

//TODO: print what has changed
module.exports.mergeJson = overrides => mergeTo => {
  return function mergeJson(log, reporter) {
    return Promise.resolve()
      .then(() => merge(mergeTo, overrides, log));
  }
};

//TODO: check if changed
module.exports.writeJson = module => fileName => json => {
  return function writeJson(log, reporter) {
    return Promise.resolve()
      .then(() => JSON.stringify(json, null, 2))
      .then(jsonString => fs.writeFileSync(join(module.path, fileName), jsonString));
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
    onMerged(`${key}: ${currentValue} -> ${newValue}`);
  });

  return dest;
}
