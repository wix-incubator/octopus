const Promise = require('bluebird');

const defaults = {mapInput: input => input, silent: false};

module.exports = ({mapInput = defaults.mapInput, silent = defaults.silent} = defaults) => fn => taskInput => {
  return function forEachModules(log, reporter) {
    return Promise.each(mapInput(taskInput), (item, index, length) => {
      return Promise.resolve().then(() => {
        if (!silent) {
          log(`${item.name} (${item.relativePath}) (${index + 1}/${length})`);
        }
        return Promise.method(fn)(item, taskInput, reporter);
      });
    }).then(() => taskInput);
  };
};