const {resolve} = require('path');
const {copySync} = require('fs-extra');
const HOOK_FILE = resolve(__dirname, './files/pre-push');

module.exports = input => {
  return function prePushHook(log, reporter) {
    return Promise.resolve().then(() => {
      log(`Adding pre-push hook '${HOOK_FILE}' to '.git/hooks/pre-push'`);
      copySync(HOOK_FILE, '.git/hooks/pre-push');
      return input;
    });
  };
};