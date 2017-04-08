const Promise = require('bluebird'),
  _ = require('lodash');

module.exports.props = inputProps => input => {
  return function props(log, reporter) {
    return Promise.resolve()
      .then(() => _.mapValues(inputProps, valFn => valFn(input)))
      .then(mappedProps => Promise.props(mappedProps));e
  }
};