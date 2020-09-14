import { makeArray } from './utils.ts'

function app(name: string) {
	console.log(makeArray(name))
}

app('hello')
