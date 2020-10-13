# Deno Run Tool (dirt)

[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dirt/mod.ts)

A task-focused build/run tool for Deno.

## Example

```ts
// .config/tasks.ts

import * as dirt from 'http://deno.land/x/dirt/mod.ts'

dirt.addTask('test', async ([type], ctx) => {
	await dirt.watchIf(ctx.flags.watch, '**/*.ts', async () => {
		await dirt.runTests(glob, {
			permissions: {
				all: true,
			},
		})
	})
})

dirt.go()
```

## CLI

You can use the following command to install and update the CLI.

```sh
deno install --unstable --allow-run --allow-env --allow-read http://deno.land/x/dirt/dirt.ts
```

After installing the CLI, you can run a particular task like this:

```sh
dirt [task] [options] [args]
```

The default location for the tasks file is `.config/tasks.ts`, but this can be changed with the `DIRT_TASKS_FILE` env variable.

```sh
export DIRT_TASKS_FILE=tasks.ts
dirt test -w
```

## Importmap Handling

When the tasks file is run, `.config/deps.json` will be respected as an import map if it exists.  `dirt.runFile` respects this setting also.

The sought after location of the importmap can be overridden with the `DENO_IMPORTMAP` env variable.

## Runtime Documentation

The runtime docs can be found [here](https://doc.deno.land/https/deno.land/x/dirt/mod.ts).
