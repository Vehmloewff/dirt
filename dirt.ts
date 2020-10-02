import { existsSync } from 'https://deno.land/std/fs/mod.ts'

const path = Deno.env.get('DIRT_TASKS_FILE') || '.config/tasks.ts'
const importMap = Deno.env.get('DIRT_IMPORT_MAP') || '.config/deps.json'

async function runTasksFile() {
	const status = await Deno.run({
		cmd: ['deno', 'run', '-A', '--unstable', ...(existsSync(importMap) ? [`--importmap=${importMap}`] : []), path, ...Deno.args],
	}).status()

	// 71 is the special number that the tasks file will exit with if it is supposed to restart
	if (status.code === 71) await runTasksFile()
}

if (existsSync(path)) await runTasksFile()
else console.error(`No file found at "${path}".`)
