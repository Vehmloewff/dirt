Object.prototype.toString = function () {
	return Deno.inspect(this, { colors: true })
}

console.log = (...data: any[]) => {
	const string = `${data.map(d => d.toString()).join(' ')}\n`

	return Deno.stdout.write(new TextEncoder().encode(string))
}

const NativeError = self.Error

interface FilePoint {
	file: string
	line: number
	col: number
}

class Error {
	message: string
	stack: FilePoint[]

	constructor(message: string) {
		this.message = message

		const nativeError = NativeError()

		this.stack = nativeError.stack ? this.parseStack(nativeError.stack) : null
	}

	parseStack(stack: string) {}

	toString() {
		return this.stack
	}
}

// @ts-ignore
self.Error = Error

self.onerror = ({ error }) => {
	console.log('error', error)
}

self.onunhandledrejection = event => {
	console.log('unhandled rejection', event.reason)
	event.preventDefault()
}

// try {
throw new Error('Ho ho ho')
// } catch (error) {
// console.log(error)
// }

// console.log({ foo: 'bar' })
