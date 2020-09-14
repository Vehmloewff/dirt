import Logger from 'https://deno.land/x/logger/logger.ts'
import importMap from './lib/import-map.ts'
import parseArgs from './lib/parse-args.ts'
import { recursiveReaddir } from 'https://deno.land/x/recursive_readdir/mod.ts'
import { globToRegExp } from 'https://deno.land/std/path/mod.ts'
import { addWatcher } from './lib/watch.ts'

const tasks: Map<string, Action> = new Map()

type MaybePromise<T> = Promise<T> | T

export interface CTX {
	flags: {
		/** Will be true if the `-w`, or `--watch` flag is provided */
		watch: boolean

		/** Will be true if the '--prod' flag is provided */
		production: boolean

		/**
		 * Flags will appear here without the dashes and camelCased
		 * '--log-level', for example, would be 'flags.raw.logLevel'
		 */
		raw: { [key: string]: (string | boolean)[] }

		/**
		 * Only the string options will appear here
		 */
		str: { [key: string]: string[] }

		/**
		 * Only the boolean options will appear here
		 */
		bool: { [key: string]: boolean[] }
	}
}

export type Action = (args: string[], ctx: CTX) => MaybePromise<void>

export const logger = new Logger()

/**
 * Adds a task.  The task will run once 'dirt.go()' is called if the first CLI arg matches
 * the name of the task.  The task under the name 'default' will run if there are no CLI args.
 */
export async function addTask(name: string, action: Action) {
	tasks.set(name, action)
}

/**
 * Run a certain task.  You should wait until all tasks have been added to do this.
 * @returns A boolean indicating if the task succeeded or not.
 */
export async function runTask(name: string): Promise<boolean> {
	const action = tasks.get(name)

	if (!action) {
		logger.error(`Could not find task '${name}'.`)
		return false
	}

	const { args, flags } = parseArgs()

	logger.info(`Running task '${name}'...`)

	try {
		await action(args, { flags })
		logger.info(`Task '${name}' succeeded.`)

		return true
	} catch (e) {
		logger.error(e)
		logger.error(`Task '${name}' failed.`)

		return false
	}
}

export interface RunCommandOptions {
	/** @default Deno.cwd() */
	cwd?: string

	/** If true, the output of the file will be logged the current stdio and runCommand.output
	 * will be an empty string.
	 * @default false
	 */
	storeOutput?: boolean

	env?: { [key: string]: string }
}

/** Run a CLI command.  If 'options.storeOutput' is true, the stdout and stderr will be printed to the console,
 * otherwise, the stdout and stderr will be concatenated and returned in the 'output' key. */
export async function runCommand(cmd: string | string[], options: RunCommandOptions = {}): Promise<{ success: boolean; output: string }> {
	if (typeof cmd === 'string') return await runCommand(cmd.split(' '), options)

	const process = Deno.run({
		cmd,
		cwd: options.cwd || Deno.cwd(),
		stdout: options.storeOutput ? 'piped' : 'inherit',
		stderr: options.storeOutput ? 'piped' : 'inherit',
		env: options.env || {},
	})

	if (options.storeOutput) {
		const decoder = new TextDecoder()
		return {
			success: (await process.status()).success,
			output: decoder.decode(await process.output()) + decoder.decode(await process.stderrOutput()),
		}
	} else return { success: (await process.status()).success, output: `` }
}

export interface DenoPermissions {
	all?: boolean
	env?: boolean
	hrtime?: boolean
	net?: boolean | string
	read?: boolean | string
	write?: boolean | string
}

export interface RunFileOptions extends RunCommandOptions {
	permissions?: DenoPermissions
	args?: string[]
}

/**
 * Run a typescript file
 * @param path The location of the file you want to run
 */
export async function runFile(path: string, opts: RunFileOptions = {}): Promise<{ success: boolean; output: string }> {
	const stringifyPermissions = (): string[] => {
		const permissions = opts.permissions || {}
		const strung: string[] = []

		if (permissions.all) strung.push(`-A`)
		else {
			if (permissions.env) strung.push(`--allow-env`)
			if (permissions.hrtime) strung.push(`--allow-hrtime`)
			if (permissions.net) {
				strung.push(`--allow-net`)
				if (typeof permissions.net === 'string') strung.push(permissions.net)
			}
			if (permissions.read) {
				strung.push(`--allow-read`)
				if (typeof permissions.read === 'string') strung.push(permissions.read)
			}
			if (permissions.write) {
				strung.push(`--allow-write`)
				if (typeof permissions.write === 'string') strung.push(permissions.write)
			}
		}

		return strung
	}

	const args = opts.args || []

	return await runCommand([`deno`, `run`, `--unstable`, ...importMap(), ...stringifyPermissions(), path, ...args], {
		cwd: opts.cwd,
		env: opts.env,
		storeOutput: opts.storeOutput,
	})
}

interface RunTestsOptions {
	hideOutput?: boolean
}

/** Runs the tests matching the glob */
export async function runTests(glob: string, opts: RunTestsOptions = {}): Promise<boolean> {
	return (
		await runCommand([`deno`, `test`, `--unstable`, ...importMap(), glob], {
			storeOutput: opts.hideOutput,
		})
	).success
}

/** Calls 'onChange' once, then resolves if 'condition' is truthy.  Otherwise it will watch the files in the cwd that
 * match 'glob' and run 'onChange' every time there is a change them. */
export async function runWatchIf(condition: any, glob: string, onChange: (filesChanged: string[]) => MaybePromise<void>) {
	const filterFiles = (files: string[]) => files.filter(file => globToRegExp(glob).test(file))
	let files = await recursiveReaddir('.')

	await onChange(filterFiles(files))

	if (condition)
		return new Promise(() => {
			let timeout: any
			addWatcher(files => {
				clearTimeout(timeout)
				timeout = setTimeout(() => onChange(filterFiles(files)), 300)
			})
		})
}

/** Bundles the specified file and it's dependencies. */
export async function bundle(path: string): Promise<string> {
	const file = await Deno.makeTempFile()

	const { success, output } = await runCommand([`deno`, `bundle`, ...importMap(), `--unstable`, path, file], { storeOutput: true })

	if (!success) {
		console.log(output)
		return `console.log(\`${output}\`)`
	}

	return await Deno.readTextFile(file)
}

/** Adds a shim for the Deno namespace using denofill */
export async function staticServer() {}

/**
 * Starts the dirt task runner.  This should be called after all tasks have been added.
 */
export async function go() {
	const { task } = parseArgs()

	runTask(task)
}
