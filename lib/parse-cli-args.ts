import { parse } from 'https://deno.land/std@0.91.0/flags/mod.ts'

export interface ActualCliArgs {
	args: CliArg[]
	options: CliOption[]
}

export type CliArg = string | number
export interface CliOption {
	name: string
	value: string | number | boolean
}

export function parseCliArgs(cliArgs: string[]): ActualCliArgs {
	const parsed = parse(cliArgs)

	const options: ActualCliArgs['options'] = []
	Object.keys(parsed).forEach(name => {
		if (name === '_') return
		options.push({ name, value: parsed[name] })
	})

	return {
		args: parsed._,
		options,
	}
}
