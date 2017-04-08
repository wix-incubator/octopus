const {modules} = require('octopus-modules');

module.exports = () => () => {
  return function buildModules() {
    return Promise.resolve(modules());
  }
};