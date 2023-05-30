import { Action } from './strategy.ts'

export async function loadDevopsFile() {
	const module = await import(await getFileUrl())
	const exposedTasks = Object.keys(module)

	const runAction = async (action: Action) => {
		const fn = module[action.id]
		if (typeof fn !== 'function') throw new Error(`Every export of devops.ts should be a function`)

		await fn(action.arguments)
	}

	return { exposedTasks, runAction }
}

async function getFileUrl() {
	const exists = async (path: string) => {
		try {
			await Deno.stat(path)
			return true
		} catch (_) {
			return false
		}
	}

	const wrapPath = (path: string) => `file://${Deno.cwd()}/${path}`

	const tryPaths = ['devops.ts', 'devops/mod.ts']

	for (const path of tryPaths) {
		if (await exists(path)) return wrapPath(path)
	}

	throw new Error(`Could not find a devops entrypoint. Tried ${tryPaths.join(', ')}`)
}
