export type TaskParam = TaskArgument | TaskOptions
export type TaskArgument = string | number
export interface TaskOptions {
	[key: string]: string | number | boolean
}

export async function executeTask(tasksFile: string, task: string, params: TaskParam[]) {
	const module = await import(tasksFile)

	if (!module[task]) throw new Error(`The checks failed to fully check!`)
	await module[task](...params)
}
