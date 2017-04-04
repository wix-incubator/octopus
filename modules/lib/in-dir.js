function asyncInDir(dir, f) {
  const originalDir = process.cwd();
  return Promise.resolve()
    .then(() => process.chdir(dir))
    .then(() => f(dir))
    .then(() => process.chdir(originalDir))
    .catch(e => {
      process.chdir(originalDir);
      throw e;
    });
}


function syncInDir(dir, f) {
  const originalDir = process.cwd();
  process.chdir(dir);
  try {
    return f(dir);
  }
  finally {
    process.chdir(originalDir);
  }
}

module.exports = {
  async: asyncInDir,
  sync: syncInDir
};