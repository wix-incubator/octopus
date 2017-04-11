const forEach = require('./lib/foreach-task'),
  loadModules = require('./lib/modules-task'),
  {readJson, writeJson, mergeJson} = require('./lib/modules-each-tasks');

module.exports.iter = {
  forEach
};

module.exports.module = {
  readJson,
  mergeJson,
  writeJson
};


module.exports.modules = {
  load: loadModules
};
