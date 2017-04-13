const forEach = require('./lib/foreach-task'),
  async = require('./lib/async-task'),
  {load, removeUnchanged, removeGitUnchanged, removeExtraneousDependencies} = require('./lib/modules-task'),
  {readJson, writeJson, mergeJson, exec, markBuilt, markUnbuilt} = require('./lib/modules-each-tasks');

module.exports.iter = {forEach, async};
module.exports.module = {readJson, mergeJson, writeJson, exec, markBuilt, markUnbuilt};
module.exports.modules = {load, removeUnchanged, removeGitUnchanged, removeExtraneousDependencies};
