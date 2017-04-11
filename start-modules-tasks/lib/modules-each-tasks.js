const {readFileSync, writeFileSync} = require('fs'),
  {join} = require('path'),
  _ = require('lodash'),
  deepKeys = require('deep-keys');

module.exports.readJson = module => fileName => () => {
  return function readJson() {
    return Promise.resolve()
      .then(() => JSON.parse(readFileSync(join(module.path, fileName)).toString()));
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
      .then(() => writeFileSync(join(module.path, fileName), JSON.stringify(json, null, 2)));
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
