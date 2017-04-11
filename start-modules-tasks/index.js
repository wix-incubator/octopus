const forEach = require('./lib/foreach-task'),
  loadModules = require('./lib/modules-task');

module.exports.iter = {
  forEach
};

module.exports.modules = {
  load: loadModules
};
