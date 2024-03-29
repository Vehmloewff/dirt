import { asserts, shCapture } from './deps.ts'

Deno.test('cli runs example', async () => {
	const { logLines } = await shCapture('deno run -A ../main.ts --foo 1 2 3', { cwd: 'example' })

	console.log(logLines)
	asserts.assert(logLines.includes('foo 1 2 3'))
})
