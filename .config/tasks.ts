import * as dirt from '../mod.ts'

dirt.addTask('test', async ([type], ctx) => {
	let glob = '**/*'

	if (type === 'unit') glob = 'tests/unit/**/*'
	else if (type) glob = type

	// only watches the file system if the --watch or -w flag is provided
	await dirt.runWatchIf(ctx.flags.watch, '**/*.ts', async () => {
		await dirt.runTests(glob)
	})
})

dirt.addTask('bundle', async () => {
	const code = await dirt.bundle('test.ts')
	await Deno.writeTextFile('.config/public/build.js', code)
})

dirt.addTask('dev', async (_, ctx) => {
	dirt.runCommand('deno run -A https://deno.land/x/serve/mod.ts .config/public')

	await dirt.runWatchIf(ctx.flags.watch, '**/*.ts', async () => {
		console.log('hi')
		await dirt.runTask('bundle')
	})
})

dirt.addTask('default', async () => {
	await dirt.runCommand('echo hi')
	console.log(await dirt.bundle('mod.ts'))
})

dirt.addTask('shims', async (_, ctx) => {
	await dirt.runWatchIf(ctx.flags.watch, 'lib/deno-shim.js', async () => {
		const data = await Deno.readTextFile('lib/deno-shim.js')
		Deno.writeTextFile(`lib/deno-shim.ts`, 'export default `' + data + '`')
	})
})

dirt.go()
