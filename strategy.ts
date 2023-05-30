import { cases } from './deps.ts'

export interface Strategy {
	showHelp: boolean
	actions: Action[]
}

export interface Action {
	id: string
	arguments: string[]
}

export interface InferStrategyParams {
	options: string[]
	args: string[]
	taskNames: string[]
}

export function inferStrategy(params: InferStrategyParams): Strategy {
	const tasksToRun: string[] = []

	for (const rawOption of params.options) {
		const option = cases.camelCase(rawOption)

		if (params.taskNames.includes(option)) {
			tasksToRun.push(option)
			continue
		}

		if (option === 'help') {
			return {
				showHelp: true,
				actions: [],
			}
		}

		// Ignore any options that have other uses
		if (
			option === 'production' || option === 'staging' || option === 'quiet' ||
			option === 'verbose' || option === 'deploy' ||
			option === 'reload'
		) continue

		throw new Error(`The task "${option}" is not exposed from devops.ts`)
	}

	const actions = inferActions(tasksToRun, params.args)
	const strategy: Strategy = { showHelp: false, actions }

	const helpAction = actions.find((action) => action.id === 'help')
	if (helpAction) return { ...strategy, actions: [helpAction] }

	if (!actions.length && params.taskNames.includes('default')) {
		actions.push({
			id: 'default',
			arguments: getArgsForTask('default', tasksToRun, params.args),
		})
	}

	if (!actions.length) {
		throw new Error(
			'No tasks were specified and no "default" task is exposed from devops.ts',
		)
	}

	return strategy
}

function inferActions(tasksToRun: string[], args: string[]): Action[] {
	const actions: Action[] = []

	for (const task of tasksToRun) {
		actions.push({
			id: task,
			arguments: getArgsForTask(task, tasksToRun, args),
		})
	}

	return actions
}

function getArgsForTask(task: string, runningTasks: string[], rawArgs: string[]) {
	const args: string[] = []

	for (const rawArg of rawArgs) {
		const arg = parseArgForTask(task, runningTasks, rawArg)
		if (arg) args.push(arg)
	}

	return args
}

function parseArgForTask(task: string, runningTasks: string[], rawArg: string) {
	const [possibleTaskName, arg] = rawArg.split('::')

	// If there is no prefix, this arg will work
	if (!arg) return rawArg

	// If there is a prefix and it is not the same as the task, it might work
	if (possibleTaskName !== task) {
		// ... but only if there are no other running tasks that make use of this prefix
		if (runningTasks.includes(possibleTaskName)) return null
	}

	return arg
}
