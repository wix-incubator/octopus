const startModules = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  start = require('start').default,
  concurrent = require('start-concurrent').default,
  exec = require('child_process').execSync,
  assert = require('assert'),
  _ = require('lodash');

function assertGitBranch(expectedBranchName) {
  return () => function assertGitBranch(log, reporter) {
    return Promise.resolve().then(() => {
      const actualBranchName = exec('git rev-parse --abbrev-ref HEAD').toString().trim('\n');
      assert(expectedBranchName === actualBranchName, `expected branch to be ${expectedBranchName}, but found ${actualBranchName}`);
    });
  }
}

function assertClean() {
  return () => function assertClean(log, reporter) {
    return Promise.resolve().then(() => {
      const uncommitedLog = exec('git status --porcelain').toString();

      assert(uncommitedLog.length === 0, `uncommitted changes found: ${uncommitedLog}`);
    });
  }
}

function assertUpToDateWith(expectedBranch) {
  return () => function assertUpToDateWith(log, reporter) {
    return Promise.resolve().then(() => {
      const uncommitedLog = _.compact(exec(`git rev-list HEAD...${expectedBranch}`).toString().split('\n'));

      assert(uncommitedLog.length === 0, `current is not up-to-date with ${expectedBranch}. commits: ${uncommitedLog.join(', ')}`);
    });
  }
}


module.exports.assert = {
  branch: assertGitBranch,
  clean: assertClean,
  upToDateWith: assertUpToDateWith
};