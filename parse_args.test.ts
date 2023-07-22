import { asserts } from './deps.ts'
import { parseArgs } from './parse_args.ts'

Deno.test('should parse out args and options', () => {
	const res = parseArgs(['foo', '--bar', '-abc', '--bin', '--baz', 'blitz'])

	asserts.assertEquals(res, { args: ['foo', 'blitz'], options: ['bar', 'a', 'b', 'c', 'bin', 'baz'] })
})

Deno.test('should eliminate duplicate args and options', () => {
	const res = parseArgs(['foo', 'foo', 'bar', '--b', '-abc'])

	asserts.assertEquals(res, { args: ['foo', 'foo', 'bar'], options: ['b', 'a', 'c'] })
})

Deno.test('should allow many args', () => {
	const res = parseArgs(['foo', 'foo', 'bar', '--b', '-abc', 'bin', 'baz', 'bat'])

	asserts.assertEquals(res, { args: ['foo', 'foo', 'bar', 'bin', 'baz', 'bat'], options: ['b', 'a', 'c'] })
})

Deno.test('duplicate args are respected', () => {
	const args = ['11', '7', '4', '4', '5', '6', '7', '1', '1', '1']
	const res = parseArgs(['--fig', ...args])

	asserts.assertEquals(res, { args, options: ['fig'] })
})
