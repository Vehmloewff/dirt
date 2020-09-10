import { existsSync } from 'https://deno.land/std/fs/mod.ts'

const path = Deno.env.get('DIRT_TASKS_FILE') || '.config/tasks.ts'
const importMap = Deno.env.get('DIRT_IMPORT_MAP') || '.config/deps.json'

if (existsSync(path))
	await Deno.run({
		cmd: ['deno', 'run', '-A', '--unstable', ...(existsSync(importMap) ? [`--importmap=${importMap}`] : []), path, ...Deno.args],
	}).status()
else console.error(`No file found at "${path}".`)
