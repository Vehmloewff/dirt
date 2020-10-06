import { resolve, globToRegExp, isAbsolute } from 'https://deno.land/std@0.71.0/path/mod.ts'
import type { Watch } from '../mod.ts'
import { dumbFilepath } from './dumb-filepath.ts'

/**
 * Takes in an array of files, either absolute or relative, and filters out the ones that do not match the watch params
 * @returns an array of files that passed the filter.  All files will be in absolute form.
 */
export function filterFiles(files: string[], watch: Watch): string[] {
	return files
		.map(dumbFilepath)
		.filter(file => pass(file, watch))
		.map(file => resolve(file))
}

function pass(file: string, watch: Watch): boolean {
	const globIsFile = (file: string, glob: string): boolean => {
		if (isAbsolute(glob)) return resolve(file) === glob
		else if (glob.startsWith('./')) return globIsFile(file, glob.slice(2))
		else if (glob.startsWith('./')) return globIsFile(file, glob.slice(3))

		return globToRegExp(glob).test(file)
	}

	const makeArray = <T>(data: T[] | T) => (Array.isArray(data) ? data : [data])

	if (typeof watch === 'string') return globIsFile(file, watch)
	else {
		let didInclude = false
		for (let glob of makeArray(watch.include)) {
			if (globIsFile(file, glob)) {
				didInclude = true
				break
			}
		}

		if (!didInclude) return false

		let didExclude = false
		for (let glob of makeArray(watch.exclude)) {
			if (globIsFile(file, glob)) {
				didExclude = true
				break
			}
		}

		return !didExclude
	}
}
