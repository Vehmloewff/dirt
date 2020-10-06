import 'https://deno.land/x/hackle/init.ts'
import * as dirt from '../mod.ts'

dirt.addTask('test', async ([type], ctx) => {
	// only watches the file system if the --watch or -w flag is provided
	await dirt.runWatchIf(ctx.flags.watch, '**/*.ts', async () => {
		await dirt.runTests('**/*.test.ts', { permissions: { read: true } })
	})
})

dirt.addTask('bundle', async () => {
	const code = await dirt.bundle('test.ts')
	await Deno.writeTextFile('.config/public/build.js', code)
})

dirt.addTask('dev', async (_, ctx) => {
	dirt.runCommand('deno run -A https://deno.land/x/serve/mod.ts .config/public')

	await dirt.runWatchIf(ctx.flags.watch, '**/*.ts', async () => {
		print('hi')
		await dirt.runTask('bundle')
	})
})

dirt.addTask('denomon', (_, ctx) => {
	dirt.denomon(ctx.flags.watch, '.config/hang.ts', { permissions: { net: true } })
})

dirt.addTask('default', async () => {
	print('hi')
})

dirt.go((_, ctx) => {
	if (ctx.flags.watch) dirt.restartWhenChanged()
})
