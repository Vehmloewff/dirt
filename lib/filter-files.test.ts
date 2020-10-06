import { resolve } from 'https://deno.land/std@0.71.0/path/mod.ts'
import { assertEquals } from 'https://deno.land/std@0.71.0/testing/asserts.ts'
import { filterFiles } from './filter-files.ts'

const files = ['me.ts', resolve('yoo.hoo'), '../mess.ts', 'txt-files/main.txt']

Deno.test({
	name: `It should filter out for a single glob`,
	fn() {
		assertEquals(filterFiles(files, '**/**.ts'), [resolve('me.ts'), resolve('../mess.ts')])
	},
})

Deno.test({
	name: `It should filter out for a single absolute filepath`,
	fn() {
		assertEquals(filterFiles(files, resolve('me.ts')), [resolve('me.ts')])
	},
})

Deno.test({
	name: `It should filter out for a single relative filepath`,
	fn() {
		assertEquals(filterFiles(files, './me.ts'), [resolve('me.ts')])
	},
})

Deno.test({
	name: `It should filter out for an include/exclude pattern`,
	fn() {
		assertEquals(filterFiles(files, { include: ['**/*.txt', '**/*.ts'], exclude: 'txt-files/**' }), [
			resolve('me.ts'),
			resolve('../mess.ts'),
		])
	},
})
