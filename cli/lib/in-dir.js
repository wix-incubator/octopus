module.exports = function inDir(dir, f) {
  const originalDir = process.cwd();
  process.chdir(dir);
  try {
    return f();
  }
  finally {
    process.chdir(originalDir);
  }
}
