module.exports = () => module => {
  return function buildModules(log) {
    const {name, relativePath} = module;
    return log(`${name} (${relativePath})`);
  };
};