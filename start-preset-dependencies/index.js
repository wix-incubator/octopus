const sync = require('./lib/sync'),
  unmanaged = require('./lib/unmanaged'),
  extraneous = require('./lib/extraneous'),
  latest = require('./lib/latest');

// module.exports.where = () => {
// };

module.exports.sync = sync.task;
module.exports.unmanaged = unmanaged.task;
module.exports.extraneous = extraneous.task;
module.exports.latest = latest.task;