const {join} = require('path'),
  {execSync} = require('child_process'),
  start = require('start').default,
  modulesTasks = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  templates = require('./lib/templates'),
  shelljs = require('shelljs');

const supportedSourceFolders = [
  {name: 'test', isTestSource: true},
  {name: 'tests', isTestSource: true},
  {name: 'src', isTestSource: false},
  {name: 'lib', isTestSource: false},
  {name: 'scripts', isTestSource: false}
];

module.exports = () => () => {
  return function generateIdeaProject(log, reporter) {
    const innerStart = start(reporter);
    return innerStart(
      startTasks.exec('rm -rf .idea && mkdir .idea && rm -f *.iml'),
      startTasks.exec(`cp ${join(__dirname, '/files/vcs.xml')} .idea/`),
      modulesTasks.modules.load(),
      createWorkspaceXmlTask(),
      createModulesXml(),
      modulesTasks.iter.async()((module, input, asyncReporter) => {
        return start(asyncReporter)(
          modulesTasks.module.exec(module)('rm -f *.iml'),
          createModuleIml(module)
        )
      })
    );
  };
};

function createWorkspaceXmlTask() {
  return modules => function createWorkspaceXmlTask(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const node = execSync('which node').toString().replace('\n', '');
      const config = {
        modules: modules.map(module => {
          return {name: module.name, relativePath: module.relativePath, nodePath: node}
        }),
        mochaPackage: modules[0].relativePath + '/node_modules/mocha'
      };

      templates.ideaWorkspaceXmlFile('.idea/workspace.xml', config);
    }).then(() => modules);
  }
}

function createModulesXml() {
  return modules => function createModulesXml(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      templates.ideaModulesFile('.idea/modules.xml', modules.map(module => {
        const group = module.relativePath.replace(module.path).replace('/' + module.name, '');
        return {name: module.name, dir: module.relativePath, group: group};
      }));
    }).then(() => modules);
  }
}

function createModuleIml(module) {
  return () => function createModuleIml(/*log, reporter*/) {
    return Promise.resolve().then(() => {
      const directories = shelljs.ls().filter(entry => shelljs.test('-d', entry));

      const sourceFolders = [];
      supportedSourceFolders.forEach(sourceFolder => {
        if (directories.indexOf(sourceFolder.name) > -1) {
          sourceFolders.push(sourceFolder);
        }
      });

      const imlFile = join(module.path, module.name + '.iml');
      templates.ideaModuleImlFile(imlFile, sourceFolders);
    });
  }
}