# octopus [![Build Status](https://img.shields.io/travis/wix/octopus/master.svg?label=build%20status)](https://travis-ci.org/wix/octopus)

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
- [Core modules](#core-modules)
- [Presets](#presets)
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

Octopus is a set of modules for [start](https://github.com/start-runner/start) but to manage a multi-module npm project with traits:
 - tasks to recursively discover/load npm modules;
 - have means for incremental task running - run tests for all, change 1 module, run tests for just one changed module and its dependees;
 - presets for managing versions across multiple modules, sync module versions;
 - generic tasks that you compose and achieve basically anything.

## Core modules

 - [octopus-modules](modules) - exports functions for finding modules, filtering, etc.
 - [octopus-start-modules](start-modules) - npm module management: syncing versions, listing, showing where one of modules is used in repo;
 - [octopus-start-modules-tasks](start-modules-tasks) - `start` tasks around [modules](modules) and extras;
 - [octopus-start-reporter](start-reporter) - custom `start` reporter to be used within `octopus ecosystem`;
 - [octopus-start-tasks](start-tasks) - misc useful `start` tasks;
 - [octopus-test-utils](test-utils) - helpers for testing multi-module npm project scenarios. 
 - [octopus-start-git](startgit) - miscelneous tasks for git-based operations. 

## Presets

 - [octopus-start-preset-prepush](start-preset-prepush) - `start` task that allows to add git prepush hook with custom logic composable from `start` tasks.
 - [octopus-start-preset-dependencies](start-preset-dependencies) - manage dependencies across multiple modules;
 - [octopus-start-preset-modules](start-preset-modules) - manage module versions across monorepo;
 - [octopus-start-preset-idea](start-preset-idea) - generate multi-module IntelliJ Idea project with run-tasks for mocha, etc.; 
 - [octopus-start-preset-depcheck](start-preset-depcheck) - preset for running [depcheck](https://github.com/depcheck/depcheck) across multiple modules.
