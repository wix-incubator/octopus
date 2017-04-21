const Promise = require('bluebird'),
  _ = require('lodash'),
  {readFileAsync} = Promise.promisifyAll(require('fs')),
  execa = require('exec-then'),
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
    return readFileAsync(join(process.cwd(), fileName), 'utf8')
      .then(JSON.parse);
  }
};

module.exports.exec = command => () => {
  return function exec(log/*, reporter*/) {
    log(`executing '${command}'`);
    return execa(command);
  }
};

module.exports.ifTrue = condition => task => () => {
  return function ifTrue(/*log, reporter*/) {
    if (condition) {
      return task();
    } else {
      return Promise.resolve();
    }
  }
};

module.exports.map = fn => input => {
  return function map(log/*, reporter*/) {
    return Promise.resolve().then(() => fn(input, log));
  }
};