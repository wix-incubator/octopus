const {resolve} = require('path'),
  ModuleBuilder = require('./module-builder');

const TEMP_DIR = './target';

module.exports.empty = () => {
  const projectDir = resolve(TEMP_DIR, Math.ceil(Math.random() * 100000).toString());
  return new ModuleBuilder(process.cwd(), projectDir, true);
};
