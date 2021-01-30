import { exists } from 'https://deno.land/std@0.85.0/fs/mod.ts'
import { parse } from 'https://deno.land/std@0.85.0/flags/mod.ts'
import { logger, shCapture } from './mod.ts'

const tasksFile = Deno.args[0]

if (!(await exists(tasksFile))) throw new Error(`Could not find module: ${tasksFile}`)

const output = await getJsonDocInfo()

interface Param {
	description: string
}

interface Task {
	name: string
	passArgs: boolean
	params: []
}

const tasks: Task[] = []

// Sort out the params here
output.forEach((def: any) => {
	// if (def.kind === 'function') {
	// 	consol
	// }
	console.log(def)
})

async function getJsonDocInfo() {
	const { output, code, error } = await shCapture(`deno doc ${tasksFile} --json`)

	if (code) throw error

	try {
		return JSON.parse(output)
	} catch (e) {
		throw new Error(`Could not parse the output from deno doc`)
	}
}
