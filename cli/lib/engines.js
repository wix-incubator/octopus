module.exports = config => {
  if (config.engine && config.engine === 'yarn') {
    return new YarnEngine();
  } else {
    return new NpmEngine();
  }
};

class NpmEngine {
  constructor() {
  }
  
  bootstrap(module) {
    const links = module.linksNames();

    if (links.length > 0) {
      return `npm link '${links.join('\' \'')}' && npm install --cache-min 3600 && npm link`;
    } else {
      return 'npm install && npm link';
    }
  }
  
  run(cmd) {
    return `npm run ${cmd}`;
  }
}

class YarnEngine {
  constructor() {
  }

  bootstrap(module) {
    const links = module.linksNames();

    if (links.length > 0) {
      return `yarn link '${links.join('\' \'')}' && yarn install --ignore-engines && yarn link`;
    } else {
      return 'yarn install --ignore-engines && yarn link';
    }
  }

  run(cmd) {
    return `yarn run ${cmd}`;
  }
}
