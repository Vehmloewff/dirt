const path = Deno.env.get('DEW_RUN_FILE') || './.config/commands.ts'

await Deno.run({
	cmd: ['deno', 'run', '-A', '--unstable', path],
}).status()
