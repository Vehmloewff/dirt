import { isAbsolute, relative } from 'https://deno.land/std@0.71.0/path/mod.ts'

export function dumbFilepath(path: string): string {
	const removeJustDot = (path: string) =>
		path
			.split('/')
			.filter(path => path !== '.')
			.join('/')

	const removeDotSlash = (path: string) => {
		if (path.startsWith('./')) return path.slice(2)
		return path
	}

	const relativePathWork = (path: string) => removeDotSlash(relative(Deno.cwd(), removeJustDot(path)))

	if (isAbsolute(path)) return relativePathWork(path)
	else return relativePathWork(path)
}
