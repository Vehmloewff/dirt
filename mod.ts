import 'https://deno.land/x/hackle/init.ts'
import Logger from 'https://deno.land/x/logger/logger.ts'
import importMap from './lib/import-map.ts'
import parseArgs from './lib/parse-args.ts'
import { recursiveReaddir } from 'https://deno.land/x/recursive_readdir/mod.ts'
import { globToRegExp } from 'https://deno.land/std/path/mod.ts'
import { addWatcher } from './lib/watch.ts'
import { filesFromGlob } from './lib/files-from-glob.ts'
import { DenoPermissions, stringifyPermissions } from './lib/stringify-permissions.ts'
import { dumbFilepath } from './lib/dumb-filepath.ts'

const tasks: Map<string, Task> = new Map()

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

export type Task = (args: string[], ctx: CTX) => MaybePromise<void>

/** @deprecated Will be removed in the next major release.  Use `Task` instead */
export type Action = Task

/** @deprecated Will be removed in the next major release.  Use https://deno.land/x/logger instead */
export const logger = new Logger()

let pids: Set<number> = new Set()

/**
 * Adds a task.  The task will run once 'dirt.go()' is called if the first CLI arg matches
 * the name of the task.  The task under the name 'default' will run if there are no CLI args.
 */
export async function addTask(name: string, task: Task) {
	tasks.set(name, task)
}

/**
 * Run a certain task.  You should wait until all tasks have been added to do this.
 * @returns A boolean indicating if the task succeeded or not.
 */
export async function runTask(name: string): Promise<boolean> {
	const task = tasks.get(name)

	if (!task) {
		hackle.error(`Could not find task '${name}'.`)
		return false
	}

	hackle.info(`Running task '${name}'...`)

	const { passed, error } = await executeTask(task)

	if (passed) hackle.info(`Task '${name}' executed`)
	if (error) hackle.error(error)
	if (!passed) hackle.error(`Task '${name}' failed`)

	return passed
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

	actionReceiver?: (actions: RunCommandActions) => void
}

export interface RunCommandActions {
	pid: number
	close: () => void
	kill: () => void
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

	pids.add(process.pid)

	if (options.actionReceiver)
		options.actionReceiver({ close: () => process.close(), kill: () => process.kill(Deno.Signal.SIGINT), pid: process.pid })

	let res: { success: boolean; output: string }

	if (options.storeOutput) {
		const decoder = new TextDecoder()
		res = {
			success: (await process.status()).success,
			output: decoder.decode(await process.output()) + decoder.decode(await process.stderrOutput()),
		}
	} else res = { success: (await process.status()).success, output: `` }

	pids.delete(process.pid)

	return res
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
	const args = opts.args || []

	return await runCommand([`deno`, `run`, `--unstable`, ...importMap(), ...stringifyPermissions(opts.permissions || {}), path, ...args], {
		cwd: opts.cwd,
		env: opts.env,
		storeOutput: opts.storeOutput,
		actionReceiver: opts.actionReceiver,
	})
}

interface RunTestsOptions {
	hideOutput?: boolean
	permissions?: DenoPermissions
}

/** Runs the tests matching the glob */
export async function runTests(glob: string, opts: RunTestsOptions = {}): Promise<boolean> {
	return (
		await runCommand(
			[`deno`, `test`, ...stringifyPermissions(opts.permissions || {}), `--unstable`, ...importMap(), ...(await filesFromGlob(glob))],
			{
				storeOutput: opts.hideOutput,
			}
		)
	).success
}

/** Calls 'onChange' once, then resolves if 'condition' is truthy.  Otherwise it will watch the files in the cwd that
 * match 'glob' and run 'onChange' every time there is a change them. */
export async function runWatchIf(condition: any, glob: string, onChange: (filesChanged: string[]) => MaybePromise<void>) {
	const filterFiles = (files: string[]) => files.filter(file => globToRegExp(glob).test(file))

	let files = await recursiveReaddir('.')

	// Run the change handler once with all the files that pass the glob...
	await onChange(filterFiles(files))

	// ...then watch for future changes if condition is truthy
	if (condition)
		return new Promise(() => {
			let timeout: any
			addWatcher(files => {
				const filteredFiles = filterFiles(files)

				if (filteredFiles.length !== 0) {
					clearTimeout(timeout)
					timeout = setTimeout(() => {
						onChange(filteredFiles)
					}, 350)
				}
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

/**
 * Restarts the current process
 *
 * Only works when the tasks file is queued by the CLI
 *
 * NOTE: You have Dirt CLI (https://github.com/Vehmloewff/dirt#cli) version `0.2.0` or greater for this function to work properly.
 * If you have a CLI version lower than `0.2`, this command will just exit and it won't start up again.
 *
 * ```ts
 * restartWhenChanged() // Exits the current process and runs '.config/tasks.ts'
 *
 * // If your tasks file is not in the default location (`.config/tasks.ts`),
 * // you can pass in an optional filepath
 * restartWhenChanged('.custom-tasks-file')
 *
 * // Or you can just pass in `import.meta.url`
 * restartWhenChanged(import.meta.url)
 * ```
 */
export function restartWhenChanged(file = '.config/tasks.ts') {
	file = dumbFilepath(file)

	let timeout: any
	addWatcher(files => {
		clearTimeout(timeout)
		setTimeout(() => {
			if (files.indexOf(file) !== -1) {
				hackle.notice(`'${file}' changed.  Restarting process...`)

				pids.forEach(pid => Deno.kill(pid, Deno.Signal.SIGINT))
				Deno.exit(71) // The special number listened to by the dirt cli
			}
		}, 350)
	})
}

export interface DenomonOptions extends RunFileOptions {
	/**
	 * A glob.  If any of these files change, `denomon` will restart `file` if `condition` is truthy
	 */
	watch?: string
}

/**
 * Runs a file and then restarts it on changes if `condition` is truthy.
 */
export function denomon(condition: any, file: string, options: DenomonOptions = {}): void {
	const setProcess = () => {
		let kill: (() => void) | null = null

		const rfo: RunFileOptions = {
			actionReceiver: actions => {
				kill = actions.kill
				if (options.actionReceiver) options.actionReceiver(actions)
			},
			args: options.args,
			cwd: options.cwd,
			env: options.env,
			storeOutput: options.storeOutput,
			permissions: options.permissions,
		}

		runFile(file, rfo)

		if (kill) return { kill: kill as () => void }

		throw new Error(`actionReceiver was never called`)
	}

	let process: ReturnType<typeof setProcess>

	runWatchIf(condition, options.watch || file, () => {
		if (process) {
			hackle.info(`Restarting '${file}' due to changes...`)
			process.kill()
		} else hackle.info(`Starting '${file}'...`)

		process = setProcess()
	})
}

/**
 * Starts the dirt task runner.  This should be called after all tasks have been added.
 * If `beforeTasks` is supplied, dirt will be run it before continuing with the task specified
 * via the CLI args.
 */
export async function go(beforeTasks?: Task) {
	const { task } = parseArgs()

	if (beforeTasks) executeTask(beforeTasks)

	runTask(task)
}

//
// Private Helpers
//

async function executeTask(task: Task): Promise<{ passed: boolean; error?: any }> {
	const { args, flags } = parseArgs()

	try {
		await task(args, { flags })
		return { passed: true }
	} catch (e) {
		return { passed: false, error: e }
	}
}
