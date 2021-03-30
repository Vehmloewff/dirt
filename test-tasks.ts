console.log('Tasks file loaded')

export interface TaskParams {
	watch: boolean
	guard: number
}

/** Does something simple */
export function task(setting: string, method: string, params: TaskParams) {
	console.log(`Running on setting: ${setting}, method: ${method}, watch: ${params.watch}, guard: ${params.guard}`)
}

export default function task2() {
	console.log('Done!')
}
