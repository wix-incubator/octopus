const startModules = require('octopus-start-modules-tasks'),
  start = require('start').default,
  depcheck = require('depcheck');

const {iter, modules} = startModules;

function depcheckTask(depcheckOpts) {
  return () => function depCheck(log, reporter) {
    return start(reporter)(
      modules.load(),
      iter.async()(item => {
        return Promise.resolve().then(() => depcheck(item.path, depcheckOpts, unused => {
          if (unused.dependencies || unused.devDependencies) {

          } else {
            Promise.resolve();
          }
        }))
      })
    )
  }
}

module.exports = depcheckTask;

const options = {
  withoutDev: false, // [DEPRECATED] check against devDependencies
  ignoreBinPackage: false, // ignore the packages with bin entry
  ignoreDirs: [ // folder with these names will be ignored
    'sandbox',
    'dist',
    'bower_components'
  ],
  ignoreMatches: [ // ignore dependencies that matches these globs
    'grunt-*'
  ],
  parsers: { // the target parsers
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx
  },
  detectors: [ // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration
  ],
  specials: [ // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack
  ],
};

depcheck('/path/to/your/project', options, (unused) => {
  console.log(unused.dependencies); // an array containing the unused dependencies
  console.log(unused.devDependencies); // an array containing the unused devDependencies
  console.log(unused.missing); // a lookup containing the dependencies missing in `package.json` and where they are used
  console.log(unused.using); // a lookup indicating each dependency is used by which files
  console.log(unused.invalidFiles); // files that cannot access or parse
  console.log(unused.invalidDirs); // directories that cannot access
});