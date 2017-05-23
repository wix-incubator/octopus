const sync = require('./lib/sync'),
  unmanaged = require('./lib/unmanaged'),
  extraneous = require('./lib/extraneous');

// module.exports.extraneous = () => {
// };
// module.exports.latest = () => {
// };
// module.exports.where = () => {
// };

module.exports.sync = sync.task;
module.exports.unmanaged = unmanaged.task;
module.exports.extraneous = extraneous.task;