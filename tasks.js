const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  modules = require('octopus-start-modules'),
  dependencies = require('octopus-start-dependencies'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  prepush = require('octopus-start-prepush'),
  idea = require('octopus-start-idea');

const start = Start(reporter());

module.exports['modules:list'] = () => start(modules.list());
module.exports['modules:where'] = moduleName => start(modules.where(moduleName));
module.exports['modules:sync'] = () => start(modules.sync());
module.exports['deps:sync'] = () => start(dependencies.sync());
module.exports['idea'] = () => start(idea());
module.exports['init'] = () => start(prepush());

module.exports.sync = () => start(
  modules.sync(),
  dependencies.sync()
)

module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.path).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.markBuilt(module)
  ))
)

module.exports.test = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged(),
  startModulesTasks.iter.forEach()(module => start(
    startModulesTasks.module.exec(module)('npm run test'),
    startModulesTasks.module.markBuilt(module)
  ))
)

module.exports.unbuild = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.markUnbuilt(module)
  ))
)

module.exports.clean = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('rm -rf node_modules && rm -rf target && rm -f npm-shrinkwarp.json && rm -f yarn.lock')
    )
  )
)