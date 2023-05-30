export function setCrossEnv(options: string[]) {
	const isProduction = options.includes('production')
	const isStaging = options.includes('staging')
	const isVerbose = options.includes('verbose')
	const isQuiet = options.includes('quiet')
	const shouldDeploy = options.includes('deploy')
	const shouldReolad = options.includes('reload')

	const environment = isStaging ? 'staging' : isProduction ? 'production' : 'dev'
	const logVerb = isVerbose ? 'verbose' : isQuiet ? 'quiet' : 'normal'

	Deno.env.set('ENV', environment)
	Deno.env.set('LOG_LEVEL', logVerb)

	if (shouldReolad) Deno.env.set('RELOAD', '1')
	if (shouldDeploy) Deno.env.set('DEPLOY', '1')
}
