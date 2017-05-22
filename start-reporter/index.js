const chalk = require('chalk');

//TODO: test this
class Colors {
  constructor() {
    this._allColors = ['green', 'yellow', 'blue', 'magenta', 'cyan', 'gray'];
    this._current = [];
  }

  next() {
    if (this._current.length === 0) {
      this._current = this._allColors;
    }

    return this._current.pop();
  }
}


module.exports = (out = console) => {
  const colors = new Colors();
  const namesAndColors = {};

  return (name, type, message) => {
    if (type === 'info' && typeof message !== 'undefined') {
      if (!namesAndColors[name]) {
        namesAndColors[name] = colors.next();
      }

      const color = namesAndColors[name];

      out.log(`[${chalk[color](name)}]: ${message}`);
    }
  };
};

