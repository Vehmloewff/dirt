import { makeHackle } from 'https://deno.land/x/hackle@1.1.1/mod.ts'
import { existsSync } from 'https://deno.land/std@0.83.0/fs/exists.ts'
import { walkSync } from 'https://deno.land/std@0.83.0/fs/walk.ts'
import * as path from 'https://deno.land/std@0.83.0/path/mod.ts'

export const logger = makeHackle()

/**
 * Return a sorted array of normalized file names matching the wildcard glob patterns.
 * Valid glob patterns are those supported by Deno's `path` library.
 * Example: `glob("tmp/*.ts", "lib/*.ts", "mod.ts");`
 */
export function glob(...patterns: string[]): string[] {
	function glob1(pattern: string): string[] {
		const globOptions = { extended: true, globstar: true } as const
		pattern = path.normalizeGlob(pattern, globOptions)
		let root = path.dirname(pattern)
		while (root !== '.' && path.isGlob(root)) {
			root = path.dirname(root)
		}
		const regexp = path.globToRegExp(pattern, globOptions)
		const iter = walkSync(root, { match: [regexp], includeDirs: false })
		return Array.from(iter, info => (info as any).path)
	}
	logger.debug('glob', `${patterns}`)
	let result: string[] = []
	for (const pattern of patterns) {
		try {
			result = [...result, ...glob1(pattern)]
		} catch (e) {
			logger.critical(`${pattern}: ${e.message}`)
		}
	}
	// Drop duplicates, normalize and sort paths.
	result = [...new Set(result)].map(p => path.normalize(p)).sort()
	logger.debug('', `${result.slice(0, 100).join('\n')}`)
	if (result.length > 100) {
		logger.debug('', `... (${result.length} files)`)
	}
	return result
}

/** Synthesize platform dependent shell command arguments. */
function shArgs(command: string): string[] {
	let cmdArgs: string[]
	if (Deno.build.os === 'windows') {
		return ['PowerShell.exe', '-Command', command]
	} else {
		let shellExe = Deno.env.get('SHELL')!
		if (!shellExe) {
			shellExe = '/bin/bash'
			if (!existsSync(shellExe)) {
				logger.critical(`cannot locate shell: no SHELL environment variable or ${shellExe} executable`)
			}
		}
		return [shellExe, '-c', command]
	}
}

/** `sh` API options. */
export interface ShOpts {
	/** Working directory. */
	cwd?: string
	/** Map containing additional shell environment variables. */
	env?: { [key: string]: string }
	stdout?: 'inherit' | 'piped' | 'null' | number
	stderr?: 'inherit' | 'piped' | 'null' | number
}

/**
 * Execute commands asynchronously in the command shell.
 *
 * - If `commands` is a string execute it.
 * - If `commands` is an array of commands execute them asynchronously.
 * - If any command fails throw an error.
 * - If `opts.stdout` or `opts.stderr` is set to `"null"` then the respective outputs are ignored.
 * - `opts.cwd` sets the shell current working directory (defaults to the parent process working directory).
 * - The `opts.env` mapping passes additional environment variables to the shell.
 *
 * On MS Windows run `PowerShell.exe -Command <cmd>`. On other platforms run `$SHELL -c <cmd>` (if `SHELL`
 * is not defined use `/bin/bash`).
 *
 * Examples:
 *
 *     await sh("echo Hello World");
 *     await sh(["echo Hello 1", "echo Hello 2", "echo Hello 3"]);
 *     await sh("echo Hello World", { stdout: "null" });
 */
export async function sh(commands: string | string[], opts: ShOpts = {}) {
	if (typeof commands === 'string') {
		commands = [commands]
	}
	logger.debug('sh', `${commands.join('\n')}\nopts: ${JSON.stringify(opts)}`)
	const processes: Deno.Process[] = []
	const results: Deno.ProcessStatus[] = []
	try {
		for (const cmd of commands) {
			const p = Deno.run({
				cmd: shArgs(cmd),
				cwd: opts.cwd,
				env: opts.env,
				stdout: opts.stdout ?? 'inherit',
				stderr: opts.stderr ?? 'inherit',
			})
			processes.push(p)
		}
		results.push(...(await Promise.all(processes.map(p => p.status()))))
	} finally {
		for (const p of processes) {
			p.close()
		}
	}
	for (const i in results) {
		const cmd = commands[i]
		const code = results[i].code
		if (code === undefined) {
			logger.critical(`sh: ${cmd}: undefined exit code`)
		}
		if (code !== 0) {
			logger.critical(`sh: ${cmd}: error code: ${code}`)
		}
	}
}

export type ShOutput = {
	code: number | undefined
	output: string
	error: string
}

/** `shCapture` API options. */
export interface ShCaptureOpts extends ShOpts {
	/** Piped to shell stdin. */
	input?: string
}

/**
 * Execute `command` in the command shell and return a promise for
 * `{code, output, error}` (the exit code, the stdout output and the
 * stderr output).
 *
 * - If the `opts.input` string has been assigned then it is piped to the
 *   shell `stdin`.
 * - `opts.cwd` sets the shell current working directory (defaults to the
 *   parent process working directory).
 * - The `opts.env` mapping passes additional environment variables to
 *   the shell.
 * - `opts.stdout` and `opts.stderr` have `Deno.RunOptions` semantics.
 *   `opts.stdout` defaults to `"piped"`. `opts.stderr` defaults to
 *   `"inherit"` (to capture stderr set `opts.stderr` to `"piped"`).
 *
 * Examples:
 *
 *     const { code, stdout } = await shCapture("echo Hello");
 *     const { code, output, error } = await shCapture( "mkdir tmpdir", { stderr: "piped" });
 *
 */
export async function shCapture(command: string, opts: ShCaptureOpts = {}): Promise<ShOutput> {
	const p = Deno.run({
		cmd: shArgs(command),
		cwd: opts.cwd,
		env: opts.env,
		stdin: opts.input !== undefined ? 'piped' : undefined,
		stdout: opts.stdout ?? 'piped',
		stderr: opts.stderr ?? 'inherit',
	})
	let status: Deno.ProcessStatus
	let outputBytes, errorBytes: Uint8Array
	try {
		if (p.stdin) {
			await p.stdin.write(new TextEncoder().encode(opts.input))
			p.stdin.close()
		}
		;[status, outputBytes, errorBytes] = await Promise.all([
			p.status(),
			p.stdout ? p.output() : Promise.resolve(new Uint8Array()),
			p.stderr ? p.stderrOutput() : Promise.resolve(new Uint8Array()),
		])
	} finally {
		p.close()
	}
	const result = {
		code: status.code,
		output: new TextDecoder().decode(outputBytes),
		error: new TextDecoder().decode(errorBytes),
	} as const
	logger.debug('shCapture:', command, `\nopts:      `, opts, `\noutputs:   `, result)
	return result
}
