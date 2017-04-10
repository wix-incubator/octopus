const Promise = require('bluebird');

module.exports = (mapInput = input => input) => fn => taskInput => {
  return function forEachModules(log, reporter) {
    return Promise.each(mapInput(taskInput), (item, index, length) => {
      log(`${item.name} (${item.relativePath}) (${index + 1}/${length})`);
      const collectingReport = collectingReporter(reporter);
      return Promise.resolve()
        .then(() => fn(item, taskInput, collectingReport.reporter))
        .finally(() => collectingReport.flush());
    });
  };
};

function collectingReporter(sourceReporter) {
  const entries = [];
  return {
    reporter: (...args) => entries.push(args),
    flush: () => entries.forEach(entry => sourceReporter(...entry))
  }
}