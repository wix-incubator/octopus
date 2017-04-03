const path = require('path'),
  shelljs = require('shelljs'),
  fs = require('fs'),
  Promise = require('bluebird');

class ModuleBuilder {
  constructor(cwd, dir, isRoot) {
    this._isRoot = isRoot || false;
    this._cwd = cwd;
    this._dir = dir;
    this.addFolder(this._dir);
  }

  get dir() {
    return this._dir;
  }

  get cwd() {
    return this._cwd;
  }

  get isRoot() {
    return this._isRoot;
  }

  inDir(fn) {
    process.chdir(this.dir);

    try {
      fn(this);
    } finally {
      process.chdir(this.cwd);
    }

    return this;
  }

  gitCommit() {
    return this.inDir(() => this.exec('git add -A && git commit -am ok'));
  }

  packageJson(overrides) {
    return this.addFile('package.json', aPackageJson(this._dir.split('/').pop(), overrides));
  }

  addFile(name, payload) {
    this.addFolder(path.dirname(name));

    if (payload && typeof payload !== 'string') {
      fs.writeFileSync(path.join(this._dir, name), JSON.stringify(payload, null, 2));
    } else {
      fs.writeFileSync(path.join(this._dir, name), payload || '');
    }

    return this;
  }

  addFolder(name) {
    shelljs.mkdir('-p', path.resolve(this._dir, name));
    return this;
  }

  module(name, cb) {
    const module = new ModuleBuilder(this._dir, path.join(this._dir, name), false);

    if (cb) {
      inDir(cb, module);
    } else {
      inDir(m => m.packageJson(m.dir.split('/').pop()), module);
    }
    return this;
  }

  exec(cmd) {
    const res = shelljs.exec(cmd);

    if (res.code) {
      throw new Error(`Script exited with error code: ${res.code} and output ${res.stdout} + ${res.stderr}`);
    } else {
      return res.stdout + res.stderr;
    }
  }

  readFile(path) {
    return shelljs.cat(path).stdout;
  }

  readJsonFile(path) {
    return JSON.parse(this.readFile(path));
  }

  within(fn) {
  const clean = () => {
    process.chdir(this.cwd);
    shelljs.rm('-rf', module.dir);
  };

  process.chdir(this.dir);

  return Promise.resolve()
    .then(() => fn(this))
    .finally(clean);
}


}

function aPackageJson(name, overrides) {
  return Object.assign({}, {
    name: name,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo "test script"',
      build: 'echo "build script"',
      release: 'echo "release script"'
    },
    author: '',
    license: 'ISC'
  }, overrides);
}


module.exports = ModuleBuilder;
