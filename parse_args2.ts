export type SchemaType = 'number' | 'string' | 'boolean'

export interface SchemaParam {
	name: string
	type: SchemaType
	isArg: boolean
	shouldCollect: boolean
}

export interface ParseParamsResult {
	arguments: unknown[]
	flags: Map<string, unknown>
}

export function parseParams(params: SchemaParam[], argv: string[]): SchemaParam {
	const values: unknown[] = []

	for (const arg in argv) {
		const isOption = arg.startsWith('--')

		if (isOption) {}
	}

	return values
}
