const {resolve} = require('path');
const {copySync} = require('fs-extra');
const HOOK_FILE = resolve(__dirname, './files/pre-push');

module.exports = () => () => {
  return function prePushHook(log, reporter) {
    return Promise.resolve()
      .then(() => copySync(HOOK_FILE,'.git/hooks/pre-push' ));
  };
};