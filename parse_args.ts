export function parseArgs(inputArgs: string[]) {
	const options: string[] = []
	const args: string[] = []

	for (const inputArg of inputArgs) {
		if (inputArg.startsWith('--')) {
			uniquePush(options, inputArg.slice(2).trim())

			continue
		}

		if (inputArg.startsWith('-')) {
			const aliases = inputArg.slice(1).trim()
			uniquePush(options, ...aliases.split(''))

			continue
		}

		uniquePush(args, inputArg)
	}

	return { options, args }
}

function uniquePush<T>(array: T[], ...items: T[]) {
	if (!items.length) return

	if (items.length > 1) {
		for (const item of items) {
			uniquePush(array, item)
		}

		return
	}

	const newItem = items[0]
	if (array.includes(newItem)) return

	array.push(newItem)
}
