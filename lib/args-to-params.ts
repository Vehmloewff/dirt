import { TaskMeta, Argument, Option } from './format-docs.ts'
import { CliArg, CliOption } from './parse-cli-args.ts'
import { TaskParam, TaskOptions } from './execute-task.ts'
import { displayFlag } from './display-flag.ts'

export function argsToParams(task: TaskMeta, args: CliArg[], options: CliOption[]): TaskParam[] {
	const taskParams: TaskParam[] = []

	task.params.forEach(param => {
		if (param.$ === 'argument') {
			const nextArg = args.shift()
			if (!nextArg) {
				if (!param.optional) throw new Error(`Expected argument '${param.name}' to be supplied as it is required`)
				return
			}
			// deno-lint-ignore valid-typeof
			if (typeof nextArg !== param.type)
				throw new Error(`Expected argument '${param.name}' to be a ${param.type}, but found as type ${typeof nextArg}`)

			return taskParams.push(nextArg)
		}

		const taskOptions: TaskOptions = {}

		param.options.forEach(optionExpected => {
			const index = options.findIndex(option => option.name === optionExpected.name)
			if (index === -1) {
				if (optionExpected.optional) return
				throw new Error(`Expected to receive the '${displayFlag(optionExpected.name)}' flag because it is required`)
			}

			const actualOption = options[index]
			// deno-lint-ignore valid-typeof
			if (typeof actualOption.value !== optionExpected.type)
				throw new Error(
					`Expected argument '${optionExpected.name}' to be a ${optionExpected.type}, but found as type ${typeof actualOption}`
				)

			options.splice(index, 1)
			taskOptions[optionExpected.name] = actualOption.value
		})

		taskParams.push(taskOptions)
	})

	return taskParams
}

export interface ExpectedCliArgs {
	args: Argument[]
	options: Option[]
}

export function getCliArgs(task: TaskMeta): ExpectedCliArgs {
	const args: Argument[] = []
	const options: Option[] = []

	task.params.forEach(param => {
		if (param.$ === 'argument') args.push(param)
		else param.options.forEach(option => options.push(option))
	})

	return {
		args,
		options,
	}
}
