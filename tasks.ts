export interface HelloParams {
	/** @default true */
	watch?: boolean
}

/** Say hello to your favorite character */
export function hello(params: HelloParams) {}

const params = {
	name: 'hello',
	description: 'there',
}
