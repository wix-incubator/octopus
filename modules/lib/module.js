module.exports = ({pkg, dependencies}) => {
  return {
    name: pkg.npm.name,
    path: pkg.fullPath,
    version: pkg.npm.version,
    dependencies
  }
};