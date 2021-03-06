export type Watcher = (files: string[], kind: 'any' | 'access' | 'create' | 'modify' | 'remove') => void

const watchers: Watcher[] = []

let watcherIsRunning = false

export async function addWatcher(watcher: Watcher) {
	watchers.push(watcher)

	if (!watcherIsRunning) {
		watcherIsRunning = true

		if (watchers.length !== 1) return

		const emitter = Deno.watchFs(['.'], { recursive: true })

		for await (const event of emitter) {
			watchers.forEach(watcher => watcher(event.paths, event.kind))
		}
	}
}
