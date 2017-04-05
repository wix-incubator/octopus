const {empty} = require('octopus-test-utils'),
  {expect} = require('chai');

describe('pre-push hook it', function () {
  this.timeout(20000);

  it('should add a pre-push hook 2', () => {
    const remoteGitRepo = empty()
      .inDir(ctx => ctx.exec('git --bare init'));

    const project = empty()
      .packageJson({name: 'a', scripts: {start: 'start-runner'}})
      .addFile('tasks.js', buildJsFile)
      .addFile('.gitignore', 'node_modules\n')
      .inDir(ctx => {
        ctx.exec('git init && git config user.email mail@example.org && git config user.name name');
        ctx.exec('cp -R ../../node_modules .');
        ctx.exec('npm link ../../');
        ctx.exec('git add -A && git commit -am ok');
        ctx.exec(`git remote add origin ${remoteGitRepo.dir}`);
      });

    return project.within(ctx => {
      ctx.exec('npm start init');
      const output = ctx.exec('git push --force origin master');

      expect(output).to.contain('sync invoked');
    });
  });
});

const buildJsFile = `
const Start = require('start').default;
const prepush = require('octopus-start-prepush');

const start = new Start();

module.exports.init = () => start(prepush);
module.exports.sync = () => start(() => () => Promise.resolve().then(() => console.log('sync invoked')));
`;
