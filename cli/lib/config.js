const path = require('path'),
  shelljs = require('shelljs');

module.exports = cwd => {
  return JSON.parse(shelljs.cat(path.join(cwd, 'octopus.json')).stdout)
};