const Promise = require('bluebird'),
  _ = require('lodash');

const defaults = {mapInput: input => input, silent: false};

module.exports = ({mapInput = defaults.mapInput, silent = defaults.silent} = defaults) => fn => taskInput => {
  return function forEachModules(log, reporter) {
    return Promise.map(mapInput(taskInput), (item, index, length) => {
      return Promise.resolve().then(() => {
        if (!silent) {
          log(`${item.name} (${item.relativePath}) (${index + 1}/${length})`);
        }
        return fn(item, taskInput, reporter);
      });
    }, {concurrency: 1}).then(_.compact);
  };
};