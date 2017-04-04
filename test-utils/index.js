const {resolve} = require('path'),
  ModuleBuilder = require('./lib/module-builder'),
  {rm} = require('shelljs');

const TEMP_DIR = './target';

module.exports.empty = () => {
  const projectDir = resolve(TEMP_DIR, Math.ceil(Math.random() * 100000).toString());
  afterEach(() => rm('-rf', projectDir));
  return new ModuleBuilder(process.cwd(), projectDir, true);
};
