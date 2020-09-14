import { CTX } from '../mod.ts'
import yargs from 'yargs'
import { tweakObject, makeArray } from '../utils.ts'

let task: string | null = null
let args: string[] | null = null
let flags: CTX['flags'] | null = null

export default function parseArgs() {
	if (args && flags && task) return { args, flags, task }

	const parsed = yargs(Deno.args)
	const rawFlags: { [key: string]: (string | boolean)[] } = tweakObject(parsed, (key, value) => {
		if (key === '_' || key === '--') return null

		return { key, value: makeArray(value) }
	})

	const keepTypeOnly = (type: string) =>
		tweakObject(rawFlags, (k, v) => {
			const filtered = v.filter(v => typeof v === type)
			if (!filtered.length) return null

			return { key: k, value: filtered }
		})

	flags = {
		watch: !!(parsed.watch || parsed.w),
		production: !!(parsed.prod || parsed.production),
		raw: rawFlags,
		str: keepTypeOnly('string') as { [key: string]: string[] },
		bool: keepTypeOnly('boolean') as { [key: string]: boolean[] },
	}

	const rawArgs = parsed._ as string[]

	task = rawArgs[0] || 'default'
	args = rawArgs.length <= 1 ? [] : rawArgs.slice(0)

	return { args, flags, task }
}
