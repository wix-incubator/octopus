const path = require('path'),
  fs = require('fs');

module.exports = cwd => {
  return JSON.parse(fs.readFileSync(path.join(cwd, 'octopus.json')));
};