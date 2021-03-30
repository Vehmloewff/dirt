// deno-lint-ignore-file no-explicit-any

export interface TaskMeta {
	description: string
	name: string
	params: Param[]
}

type Param = Argument | Options

export interface Argument {
	$: 'argument'
	type: 'number' | 'string'
	name: string
	optional: boolean
}

export interface Options {
	$: 'options'
	options: Option[]
}

export interface Option {
	name: string
	type: 'string' | 'boolean' | 'number'
	description: string
	optional: boolean
}

export function formatDocs(json: any): TaskMeta[] {
	const result: TaskMeta[] = []

	json.forEach((item: any) => {
		if (item.kind === 'function') {
			const params: TaskMeta['params'] = []

			for (const param of item.functionDef.params) {
				params.push(parseParam(param, item, json))
			}

			result.push({
				description: item.jsDoc,
				name: item.name,
				params,
			})
		}
	})

	// TODO: ensure no duplicate options

	return result
}

/** `param` is the current function parameter, `item` is the current function, `json` is the entire DenoDoc result */
function parseParam(param: any, item: any, json: any): Param {
	if (param.kind === 'identifier') {
		if (param.tsType.repr === 'string' || param.tsType.repr === 'number') return parseArgument(param)
		else if (param.tsType.kind === 'typeRef') return parseOptions(param, json)
		else
			throw new Error(
				`Function parameters must be of name 'string', or an interface\n  ${item.location.filename}:${item.location.line}:${item.location.col}`
			)
	} else if (param.kind === 'assign') {
		if (param.left.tsType.repr === 'string' || param.left.tsType.repr === 'number') return parseArgument(param.left)
		else if (param.left.tsType.kind === 'typeRef') return parseOptions(json, param.left)
		else
			throw new Error(
				`Function parameters must be of name 'string', or an interface\n  ${item.location.filename}:${item.location.line}:${item.location.col}`
			)
	} else
		throw new Error(
			`Unexpected function parameter in function '${item.name}'\n  ${item.location.filename}:${item.location.line}:${item.location.col}`
		)
}

function parseArgument(param: any): Argument {
	return { $: 'argument', type: param.tsType.repr, name: param.name, optional: param.optional }
}

/** `param` is the current function argument, `json` is the entire DenoDoc result */
function parseOptions(param: any, json: any): Options {
	const interfaceFound = json.find((i: any) => i.kind === 'interface' && i.name === param.tsType.repr)
	if (!interfaceFound) throw new Error(`Expected the '${param.tsType.repr}' interface to be exported`)

	const options: Options['options'] = []
	interfaceFound.interfaceDef.properties.forEach((property: any) => {
		let type: 'string' | 'number' | 'boolean'

		if (property.tsType.repr === 'boolean') type = 'boolean'
		else if (property.tsType.repr === 'string') type = 'string'
		else if (property.tsType.repr === 'number') type = 'number'
		else
			throw new Error(
				`Expected interface property to be a string, number, or boolean, but found name '${property.tsType.repr}'\n  ${property.location.file}:${property.location.line}:${property.location.col}`
			)

		options.push({ name: property.name, description: property.jsDoc, type, optional: property.optional })
	})

	return { $: 'options', options }
}
