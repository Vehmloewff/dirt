import { shCapture } from 'https://denopkg.com/Vehmloewff/deno-utils/mod.ts'

export async function getDocs(file: string) {
	const { output, code, error } = await shCapture(`deno doc ${file} --json`)

	if (code) throw error

	try {
		return JSON.parse(output)
	} catch (e) {
		throw new Error(`Could not parse the output from deno doc`)
	}
}
