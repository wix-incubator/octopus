const fixtures = require('./support/fixtures');

module.exports = {
  aProject: ({engine, scripts} = {}) => {
    return fixtures.project({engine})
      .module('a', module => module.packageJson({version: '1.0.0', scripts}))
      .module('b', module => module.packageJson({version: '1.0.1', dependencies: {'a': '~1.0.0'}, scripts}))
      .module('c', module => module.packageJson({version: '1.1.0', dependencies: {'b': '~1.0.1'}, scripts}));
  },

  aComplexProject: engine => {
    const a = '~1.0.0';
    const b = '~1.0.1';
    const c = '~1.1.0';

    return fixtures.project({engine})
      .module('a', module => module.packageJson({version: '1.0.0'}))
      .module('b', module => module.packageJson({version: '1.0.1'}))
      .module('c', module => module.packageJson({version: '1.1.0'}))
      .module('d', module => module.packageJson({version: '1.0.0', dependencies: {a, b, c}}))
  }
};