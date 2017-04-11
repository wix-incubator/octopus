const Promise = require('bluebird'),
  _ = require('lodash');

const defaults = {mapInput: input => input, silent: false};

module.exports = ({mapInput = defaults.mapInput, silent = defaults.silent} = defaults) => fn => taskInput => {
  return function forEachModules(log, reporter) {
    return Promise.map(mapInput(taskInput), (item, index, length) => {
      silent || log(`${item.name} (${item.relativePath}) (${index + 1}/${length})`);

      return Promise.resolve()
        .then(() => fn(item, taskInput, reporter));
    }).then(_.compact);
  };
};