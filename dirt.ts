const path = Deno.env.get('DIRT_TASKS_FILE') || './.config/tasks.ts'
const importMap = Deno.env.get('DIRT_IMPORT_MAP') || './.config/deps.json'

await Deno.run({
	cmd: ['deno', 'run', '-A', '--unstable', `--importmap="${importMap}"`, path],
}).status()
