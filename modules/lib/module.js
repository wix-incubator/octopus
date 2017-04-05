module.exports = ({pkg, dependencies}) => {
  return {
    name: pkg.npm.name,
    path: pkg.fullPath,
    relativePath: pkg.relativePath,
    version: pkg.npm.version,
    dependencies
  }
};