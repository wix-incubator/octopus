const Promise = require('bluebird'),
  _ = require('lodash'),
  fs = Promise.promisifyAll(require('fs')),
  {join} = require('path');


module.exports.props = inputProps => input => {
  return function props(/*log, reporter*/) {
    return Promise.resolve(inputProps)
      .then(props => _.mapValues(props, valFn => valFn(input)))
      .then(mappedProps => Promise.props(mappedProps));
  }
};

module.exports.log = strOrFn => input => {
  return function logLine(log /*, reporter*/) {
    return Promise.resolve().then(() => {
      const logLine = typeof strOrFn === 'function' ? strOrFn(input) : strOrFn;
      log(logLine);
      return input;
    });
  }
};

module.exports.readJson = fileName => () => {
  return function readJson(/*log, reporter*/) {
    return fs.readFileAsync(join(process.cwd(), fileName))
      .then(JSON.parse);
  }
};