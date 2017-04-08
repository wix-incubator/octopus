const Promise = require('bluebird');

module.exports = (mapInput = input => input) => fn => modulesOrOpts => {
  return function forEachModules(log, reporter) {
    return Promise.each(mapInput(modulesOrOpts), (item, index, length) => {
      log(`${item.relativePath} (${index + 1}/${length})`);
      return fn(item, index, length, modulesOrOpts);
    });
  }
};