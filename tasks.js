const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  modules = require('octopus-start-preset-modules'),
  dependencies = require('octopus-start-preset-dependencies'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  prepush = require('octopus-start-preset-prepush'),
  idea = require('octopus-start-preset-idea'),
  depcheck = require('octopus-start-preset-depcheck');

const start = Start(reporter());

module.exports['modules:list'] = () => start(modules.list());
module.exports['modules:where'] = moduleName => start(modules.where(moduleName));
module.exports['modules:sync'] = () => start(modules.sync());
module.exports['deps:sync'] = () => start(dependencies.sync());
module.exports['deps:unmanaged'] = () => start(dependencies.unmanaged());
module.exports['deps:extraneous'] = () => start(dependencies.extraneous());
module.exports['idea'] = () => start(idea());
module.exports['init'] = () => start(prepush());
module.exports['depcheck'] = () => start(depcheck({ignoreMatches: ['start-simple-cli']}));

module.exports.sync = () => start(
  modules.sync(),
  dependencies.sync()
)

module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('bootstrap'),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.name).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.markBuilt(module, 'bootstrap')
  ))
)

module.exports.test = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('test'),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('npm run test'),
    startModulesTasks.module.markBuilt(module, 'test')
  ))
)

module.exports.clean = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('rm -rf node_modules && rm -rf target && rm -f npm-shrinkwarp.json && rm -f yarn.lock')
    )
  )
)

module.exports.release = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('npm run release'),
    startModulesTasks.module.exec(module)('npm publish || true')
  ))
)