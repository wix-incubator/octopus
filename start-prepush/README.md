# octopus-start-prepush

[start-runner](https://github.com/start-runner) task that adds a git pre-push script that runs task `sync` on before git push.

# install

```bash
npm install --save-dev octopus-start-prepush
```

# Usage

Add task to **tasks.spec.js** and another task `sync` that will be invoked before git push: 
```js
const Start = require('start'),
 prepush = require('octopus-start-prepush');

const start = new Start();

module.exports.init = () => start(prepush);
module.exports.sync = () => start(() => console.log('synced'));
```

Add `start-simple-cli` task to `package.json` scripts:
```json
{
  "scripts": {
    "start": "start-runner"
  }
}
```

Run `npm start init` once to have hook installed and then on every next push `npm start sync` will be executed.