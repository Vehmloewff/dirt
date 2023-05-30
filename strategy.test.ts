import { asserts } from './deps.ts'
import { inferStrategy } from './strategy.ts'

Deno.test('should detect strategy', () => {
	const strategy = inferStrategy({
		options: ['reload', 'staging', 'ci', 'lint', 'd', 'be-real'],
		args: ['foo', 'ci::bar', 'beReal::baz'],
		taskNames: ['ci', 'lint', 'beReal', 'a', 'b', 'c', 'd'],
	})

	asserts.assertEquals(strategy, {
		showHelp: false,

		actions: [
			{ id: 'ci', arguments: ['foo', 'bar'] },
			{ id: 'lint', arguments: ['foo'] },
			{ id: 'd', arguments: ['foo'] },
			{ id: 'beReal', arguments: ['foo', 'baz'] },
		],
	})
})

Deno.test('should error at tasks that don\'t exist', () => {
	asserts.assertThrows(() =>
		inferStrategy({
			options: ['task', 'invalid'],
			args: [],
			taskNames: ['task'],
		})
	)
})

Deno.test('should use the default task when no tasks are present if it exists', () => {
	const strategy = inferStrategy({
		options: [],
		args: ['some-argument', 'default::other-arg'],
		taskNames: ['default', 'otherTask'],
	})

	asserts.assertEquals(strategy, {
		showHelp: false,
		actions: [
			{ id: 'default', arguments: ['some-argument', 'other-arg'] },
		],
	})
})

Deno.test('should error when no tasks exist and there is no default task', () => {
	asserts.assertThrows(() =>
		inferStrategy({
			options: [],
			args: [],
			taskNames: ['task'],
		})
	)
})

Deno.test('should quit everything and show help if it is requested', () => {
	const strategy = inferStrategy({
		options: ['task', 'help'],
		args: [],
		taskNames: ['task', 'otherTask'],
	})

	asserts.assertEquals(strategy, {
		showHelp: true,
		actions: [],
	})
})

Deno.test('should not show help if the help task is defined', () => {
	const strategy = inferStrategy({
		options: ['task', 'help'],
		args: [],
		taskNames: ['task', 'help', 'otherTask'],
	})

	asserts.assertEquals(strategy, {
		showHelp: false,
		actions: [{ id: 'help', arguments: [] }],
	})
})

Deno.test('passed task names should correspond to camelCase defined tasks', () => {
	const strategy = inferStrategy({
		options: ['some-task', 'other_task', 'NEW_TASK', 'CrazyTask'],
		args: [],
		taskNames: ['someTask', 'otherTask', 'newTask', 'crazyTask'],
	})

	asserts.assertEquals(strategy, {
		showHelp: false,
		actions: [
			{ id: 'someTask', arguments: [] },
			{ id: 'otherTask', arguments: [] },
			{ id: 'newTask', arguments: [] },
			{ id: 'crazyTask', arguments: [] },
		],
	})
})
