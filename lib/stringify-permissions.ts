export interface DenoPermissions {
	all?: boolean
	env?: boolean
	run?: boolean
	hrtime?: boolean
	net?: boolean | string
	read?: boolean | string
	write?: boolean | string
}

export function stringifyPermissions(permissions: DenoPermissions): string[] {
	const strung: string[] = []

	if (permissions.all) strung.push(`-A`)
	else {
		if (permissions.env) strung.push(`--allow-env`)
		if (permissions.run) strung.push(`--allow-run`)
		if (permissions.hrtime) strung.push(`--allow-hrtime`)
		if (permissions.net) {
			strung.push(`--allow-net`)
			if (typeof permissions.net === 'string') strung.push(permissions.net)
		}
		if (permissions.read) {
			strung.push(`--allow-read`)
			if (typeof permissions.read === 'string') strung.push(permissions.read)
		}
		if (permissions.write) {
			strung.push(`--allow-write`)
			if (typeof permissions.write === 'string') strung.push(permissions.write)
		}
	}

	return strung
}
