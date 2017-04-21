# octopus-start-tasks

Miscellaneous tasks for `Start`.

## install

```bash
npm install --save-dev octopus-start-tasks
```

## API

### props(obj)
`Start` task that maps provided object values, which are of `input => Promise`.

Say given input is String 'what', then:

js
```
props({one: input => 'say ' + what})
```
 
will return `{one: 'say what'}`. 
 
### log(strOrFn)
`Start` task that logs provided String or function `input => String` via `Start` reporter.

### readJson(fileName)
`Start` task that reads json file and returns a json object.

### exec(cmd)
`Start` task that executed a command and returns {stdout, stderr}.

### map(fn)
`Start` task that calls a provided function with (input, log), where:
 - input - task input;
 - log - log function.
 
and returns output of `fn` function.