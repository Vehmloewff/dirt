import { TaskMeta } from './format-docs.ts'
import { getCliArgs } from './args-to-params.ts'
import { displayFlag } from './display-flag.ts'

export function getTaskHelp(task: TaskMeta) {
	const { args, options } = getCliArgs(task)

	const prettyArgs = args.map(arg => `<${arg.name}${arg.optional ? '?' : ''}>`).join(' ')

	const prettyOptions = options
		.map(
			option => `  ${displayFlag(option.name)}          ${specifyIfTruthy(option.description)} ${option.optional ? '' : '(required)'}`
		)
		.join('\n')

	return `Usage: dirt ${task.name} ${prettyArgs} [...options]\n\n${specifyIfTruthy(task.description)}\n\nOptions:\n${prettyOptions}`
}

export function getAllHelp(tasks: TaskMeta[]) {
	const firstLineOnly = (str: string) => str.split('\n')[0]

	const prettyTasks = tasks.map(task => `  ${task.name}          ${firstLineOnly(specifyIfTruthy(task.description))}`).join('\n')

	return `Usage: dirt <task>\n\nTasks:\n${prettyTasks}`
}

function specifyIfTruthy(str: string) {
	if (str) return str
	return ''
}
