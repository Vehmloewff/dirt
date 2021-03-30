export function displayFlag(flagName: string): string {
	if (flagName.length === 1) return `-${flagName}`
	return `--${flagName}`
}
