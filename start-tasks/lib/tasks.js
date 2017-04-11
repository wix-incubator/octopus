const Promise = require('bluebird'),
  _ = require('lodash');

module.exports.props = inputProps => input => {
  return function props() {
    return Promise.resolve()
      .then(() => _.mapValues(inputProps, valFn => valFn(input)))
      .then(mappedProps => Promise.props(mappedProps));e
  }
};

module.exports.printLog = what => input => {
  return function logLine(log) {
    return Promise.resolve().then(() => {
      log(what);
      return input;
    });
  }
};