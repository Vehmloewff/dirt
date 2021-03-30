import { TaskMeta } from './format-docs.ts'
import { CliArg, CliOption } from './parse-cli-args.ts'
import { getCliArgs } from './args-to-params.ts'
import { getAllHelp, getTaskHelp } from './generate-help.ts'
import { argsToParams } from './args-to-params.ts'
import { executeTask } from './execute-task.ts'

export async function discoverStrategy(tasksFile: string, tasks: TaskMeta[], args: CliArg[], options: CliOption[]) {
	// This is when we show the overview help for all tasks:
	// - When the given task name is `help` and there is no actual task by that name
	// - When there is no given task and there is either the `--help`, or `-h` option
	// This is when we show the detailed help for a specific task
	// - When the given task name is `help` and there are no actual task by that name,
	//   and when the first argument of that task is the name of an actual task
	// - When the given task name is a valid task - and the unsupported `--help` or
	//   unsupported `-h` flag was passed

	function optionIsSupported(option: string, task: string): boolean {
		const taskMeta = tasks.find(t => t.name === task)
		if (!taskMeta) throw new Error(`The task '${task}' is not properly exported by the tasks file`)

		const expectedArgs = getCliArgs(taskMeta)
		if (expectedArgs.options.find(o => o.name === option)) return true
		return false
	}

	async function runTask(task: string) {
		const taskMeta = tasks.find(t => t.name === task)
		if (!taskMeta) throw new Error(`The task '${task}' is not properly exported by the tasks file`)

		const params = argsToParams(taskMeta, args.slice(1), options)
		await executeTask(tasksFile, task, params)
	}

	const taskIsPassed = () => args[0] && typeof args[0] === 'string'
	const supportedTaskIsPassed = () => !!tasks.find(task => task.name === args[0])
	const helpArgIsPassed = () => args[0] === 'help'
	const secondArgIsPassed = () => args[1] && typeof args[1] === 'string'
	const smallHelpOptionIsPassed = () => options.find(o => o.name === 'h' && o.value === true)
	const largeHelpOptionIsPassed = () => options.find(o => o.name === 'help' && o.value === true)

	if (taskIsPassed()) {
		if (supportedTaskIsPassed()) {
			const taskName = args[0] as string

			if (smallHelpOptionIsPassed()) {
				if (optionIsSupported('h', taskName)) return await runTask(taskName)
				return showHelpForTask(taskName, tasks)
			}

			if (largeHelpOptionIsPassed()) {
				if (optionIsSupported('help', taskName)) return await runTask(taskName)
				return showHelpForTask(taskName, tasks)
			}

			return await runTask(taskName)
		}

		if (helpArgIsPassed()) {
			if (secondArgIsPassed()) return showHelpForTask(args[1] as string, tasks)
			return showAllHelp(tasks)
		}

		throw new Error(`The task '${args[0]}' is not properly exported by the tasks file`)
	}

	if (smallHelpOptionIsPassed() || largeHelpOptionIsPassed()) return showAllHelp(tasks)

	if (!tasks.find(t => t.name === 'default')) throw new Error(`The tasks file does not correctly export a default task`)
	runTask('default')
}

function showAllHelp(tasks: TaskMeta[]) {
	showHelp(getAllHelp(tasks))
}

function showHelpForTask(task: string, tasks: TaskMeta[]) {
	const taskMeta = tasks.find(t => t.name === task)
	if (!taskMeta) throw new Error(`The task '${task}' is not properly exported by the tasks file`)

	showHelp(getTaskHelp(taskMeta))
}

function showHelp(help: string) {
	console.log(help)
	Deno.exit()
}
