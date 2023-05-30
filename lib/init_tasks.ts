import { fsUtils } from '../deps.ts'
import { discoverStrategy } from './discover-strategy.ts'

export async function initTasks(initialArgs: string[]) {
	fsUtils.exists()
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
}
