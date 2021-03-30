import { exists } from 'https://deno.land/std@0.85.0/fs/mod.ts'
import { resolve } from 'https://deno.land/std@0.91.0/path/mod.ts'
import { parseCliArgs } from './lib/parse-cli-args.ts'
import { getDocs } from './lib/get-docs.ts'
import { formatDocs } from './lib/format-docs.ts'
import { discoverStrategy } from './lib/discover-strategy.ts'

let tasksFile = Deno.args[0]
const tasksArgs = Deno.args.slice(1)

if (!tasksFile) throw new Error(`You must specify a tasks file as the first argument`)
else if (tasksFile === '--help' || tasksFile === '-h') {
	console.log(`The documentation is on the README.  https://github.com/Vehmloewff/dirt#readme`)
	Deno.exit()
} else if (tasksFile === '--version' || tasksFile === '-v') {
	console.log(`1.0.0`)
	Deno.exit()
}

tasksFile = resolve(tasksFile)

if (!(await exists(tasksFile))) throw new Error(`Could not find module: ${tasksFile}`)

const tasks = formatDocs(await getDocs(tasksFile))

if (!tasks.length) {
	console.log(
		`No tasks found at ${tasksFile}\n\nTo see the docs on how to create a task, visit https://github.com/Vehmloewff/dirt#creating-tasks`
	)
	Deno.exit()
}

const { args, options } = parseCliArgs(tasksArgs)

await discoverStrategy(tasksFile, tasks, args, options)
