export function makeArray<T>(maybeArr: T | T[]): T[] {
	if (Array.isArray(maybeArr)) return maybeArr
	return [maybeArr]
}

export function tweakObject<V, NV>(
	obj: { [key: string]: V },
	cb: (key: string, value: V) => { key: string; value: NV } | null
): { [key: string]: NV } {
	let newObj: { [key: string]: NV } = {}

	for (let key in obj) {
		const value = obj[key]
		const result = cb(key, value)

		if (result) newObj[result.key] = result.value
	}

	return newObj
}
