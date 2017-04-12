const Promise = require('bluebird'),
  _ = require('lodash'),
  {readFileAsync} = Promise.promisifyAll(require('fs')),
  execa = require('execa'),
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
    return readFileAsync(join(process.cwd(), fileName))
      .then(JSON.parse);
  }
};

module.exports.exec = command => () => {
  return function exec(/*log, reporter*/) {
    return execa.shell(command);
  }
};