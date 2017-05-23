const sync = require('./lib/sync'),
  unmanaged = require('./lib/unmanaged'),
  extraneous = require('./lib/extraneous');

// module.exports.extraneous = () => {
// };
// module.exports.latest = () => {
// };
// module.exports.where = () => {
// };

module.exports.sync = sync;
module.exports.unmanaged = unmanaged;
module.exports.extraneous = extraneous;