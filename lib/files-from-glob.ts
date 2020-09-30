import { recursiveReaddir } from 'https://deno.land/x/recursive_readdir@v2.0.0/mod.ts'
import { globToRegExp } from 'https://deno.land/std@0.71.0/path/glob.ts'

export async function filesFromGlob(glob: string, dir = '.') {
	const files = await recursiveReaddir(dir)
	const regex = globToRegExp(glob)

	return files.filter(file => regex.test(file))
}
