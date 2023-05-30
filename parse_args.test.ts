import { asserts } from './deps.ts'
import { parseArgs } from './parse_args.ts'

Deno.test('should parse out args and options', () => {
	const res = parseArgs(['foo', '--bar', '-abc', '--bin', '--baz', 'blitz'])

	asserts.assertEquals(res, { args: ['foo', 'blitz'], options: ['bar', 'a', 'b', 'c', 'bin', 'baz'] })
})

Deno.test('should eliminate duplicate args and options', () => {
	const res = parseArgs(['foo', 'foo', 'bar', '--b', '-abc'])

	asserts.assertEquals(res, { args: ['foo', 'bar'], options: ['b', 'a', 'c'] })
})
