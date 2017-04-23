const exec = require('child_process').execSync,
  assert = require('assert'),
  _ = require('lodash'),
  dateformat = require('dateformat');

function assertGitBranch(expectedBranchName) {
  return () => function assertGitBranch(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const actualBranchName = exec('git rev-parse --abbrev-ref HEAD').toString().trim('\n');
      assert(expectedBranchName === actualBranchName, `expected branch to be ${expectedBranchName}, but found ${actualBranchName}`);
    });
  }
}

function assertClean() {
  return () => function assertClean(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const uncommitedLog = exec('git status --porcelain').toString();

      assert(uncommitedLog.length === 0, `uncommitted changes found: ${uncommitedLog}`);
    });
  }
}

function assertUpToDateWith(expectedBranch) {
  return () => function assertUpToDateWith(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const uncommitedLog = _.compact(exec(`git rev-list HEAD...${expectedBranch}`).toString().split('\n'));

      assert(uncommitedLog.length === 0, `current is not up-to-date with ${expectedBranch}. commits: ${uncommitedLog.join(', ')}`);
    });
  }
}

function latestTag(pattern) {
  return () => function latestTag(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const tags = _.compact(exec('git tag').toString().split('\n'));
      const filteredAndSorted = tags.filter(tag => tag.startsWith(pattern)).sort();

      assert(filteredAndSorted.length !== 0, `not tags matching pattern ${pattern} found`);

      return filteredAndSorted.pop();
    });
  }
}


function tag(pattern) {
  return () => function latestTag(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const now = dateformat(Date.now(), '-yyy-MM-dd-HH_mm_ss_l');

      const tag = `${pattern}${now}`;
      exec(`git tag '${tag}'`);
      return tag;
    });
  }
}

module.exports.assert = {
  branch: assertGitBranch,
  clean: assertClean,
  upToDateWith: assertUpToDateWith
};

module.exports.latestTag = latestTag;
module.exports.tag = tag;