# octopus [![Build Status](https://img.shields.io/travis/wix/octopus/master.svg?label=build%20status)](https://travis-ci.org/wix/octopus) [![octopus-cli](https://img.shields.io/npm/v/octopus-cli.svg?label=octopus-cli)](https://www.npmjs.com/package/octopus-cli)

Octopus is a set of modules for [start](https://github.com/start-runner/start) but to manage a multi-module npm project with traits:
 - tasks to recursively discover/load npm modules;
 - have means for incremental task running - run tests for all, change 1 module, run tests for just one module + dependees;
 - presets for managing versions across multiple modules, sync module versions;
 - generic tasks that you compose and achieve basically anything.

Modules:
 - [modules](modules) - exports functions for finding modules, filtering, etc.
 - [start-modules](start-modules) - npm module management: syncing versions, listing, showing where one of modules is used in repo;
 - [start-dependencies](start-dependencies) - manage dependencies across multiple modules;
 - [start-idea](start-dependencies) - generate multi-module IntelliJ Idea project with run-tasks for mocha, etc.; 
 - [start-modules-tasks](start-modules-tasks) - `start` tasks around [modules](modules) and extras;
 - [start-prepush](start-prepush) - `start` task that allows to add git prepush hook with custom logic composable from `start` tasks.
 - [start-reporter](start-reporter) - custom `start` reporter to be used within `octopus ecosystem`;
 - [start-tasks](start-tasks) - misc useful `start` tasks;
 - [test-utils](test-utils) - helpers for testing multi-module npm project scenarios. 