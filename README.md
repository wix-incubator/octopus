# octopus [![Build Status](https://img.shields.io/travis/wix/octopus/master.svg?label=build%20status)](https://travis-ci.org/wix/octopus)


Octopus is a set of modules for [start](https://github.com/start-runner/start) but to manage a multi-module npm project with traits:
 - tasks to recursively discover/load npm modules;
 - have means for incremental task running - run tests for all, change 1 module, run tests for just one module + dependees;
 - presets for managing versions across multiple modules, sync module versions;
 - generic tasks that you compose and achieve basically anything.

## Modules

 - [![octopus-modules](https://img.shields.io/npm/v/octopus-modules.svg?label=octopus-modules)](modules) - exports functions for finding modules, filtering, etc.
 - [![octopus-start-modules](https://img.shields.io/npm/v/octopus-start-modules.svg?label=octopus-start-modules)](start-modules) - npm module management: syncing versions, listing, showing where one of modules is used in repo;
 - [![octopus-start-dependencies](https://img.shields.io/npm/v/octopus-start-dependencies.svg?label=octopus-start-dependencies)](start-dependencies) - manage dependencies across multiple modules;
 - [![octopus-start-idea](https://img.shields.io/npm/v/octopus-start-idea.svg?label=octopus-start-idea)](start-idea) - generate multi-module IntelliJ Idea project with run-tasks for mocha, etc.; 
 - [![octopus-start-modules-tasks](https://img.shields.io/npm/v/octopus-start-modules-tasks.svg?label=octopus-start-modules-tasks)](start-modules-tasks) - `start` tasks around [modules](modules) and extras;
 - [![octopus-start-prepush](https://img.shields.io/npm/v/octopus-start-prepush.svg?label=octopus-start-prepush)](start-prepush) - `start` task that allows to add git prepush hook with custom logic composable from `start` tasks.
 - [![octopus-start-reporter](https://img.shields.io/npm/v/octopus-start-reporter.svg?label=octopus-start-reporter)](start-reporter) - custom `start` reporter to be used within `octopus ecosystem`;
 - [![octopus-start-tasks](https://img.shields.io/npm/v/octopus-start-tasks.svg?label=octopus-start-tasks)](start-tasks) - misc useful `start` tasks;
 - [![octopus-test-utils](https://img.shields.io/npm/v/octopus-test-utils.svg?label=octopus-test-utils)](test-utils) - helpers for testing multi-module npm project scenarios. 
