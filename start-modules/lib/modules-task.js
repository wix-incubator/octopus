const {modules} = require('octopus-modules');

module.exports = () => () => {
  return function buildModules() {
    return modules();
  }
};