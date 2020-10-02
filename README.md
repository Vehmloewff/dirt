# Deno Run Tool (dirt)

[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dirt/mod.ts)

Run your build/run tasks in style!

## Example

```ts
// .config/tasks.ts

import * as dirt from 'http://deno.land/x/dirt/mod.ts'

dirt.addTask('test', async ([type], ctx) => {
	let glob = '**/*'

	if (type === 'unit') glob = 'tests/unit/**/*'
	else if (type) glob = type

	// only watches the file system if the --watch or -w flag is provided
	await dirt.watchIf(ctx.flags.watch, '**/*.ts', async () => {
		await dirt.runTests(glob, {
			permissions: {
				all: true,
			},
		})
	})
})

dirt.addTask('bundle', async () => {
	const code = await dirt.bundle('mod.ts')
	await dirt.write('.config/public/build.js', code)
})

dirt.addTask('dev', async (_, ctx) => {
	await dirt.runCommand('deno run -A https://deno.land/x/serve/mod.ts .config/public')

	await dirt.watchIf(ctx.flags.watch, async () => {
		await dirt.runTask('bundle')
	})
})

dirt.go((_, ctx) => {
	if (ctx.flags.watch) dirt.restartWhenChanged()
})
```

## CLI

You can use the following command to install and update the CLI.

```sh
deno install --unstable --allow-run --allow-env --allow-read http://deno.land/x/dirt/dirt.ts
```

After installing the CLI, you can run a particular task like this:

````sh
dirt [task] [options] [args]
```

## Usage

```ts
import * as dirt from 'http://deno.land/x/dirt/mod.ts'
````

## Documentation

Docs can be found [here](https://doc.deno.land/https/deno.land/x/dirt/mod.ts).
