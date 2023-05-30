import { setCrossEnv } from './cross_env.ts'
import { generateHelp } from './help.ts'
import { loadDevopsFile } from './load.ts'
import { parseArgs } from './parse_args.ts'
import { inferStrategy } from './strategy.ts'

const { args, options } = parseArgs(Deno.args)
setCrossEnv(options)

const { exposedTasks, runAction } = await loadDevopsFile()
const strategy = inferStrategy({ args, options, taskNames: exposedTasks })

if (strategy.showHelp) console.log(generateHelp(exposedTasks))
else await Promise.all(strategy.actions.map(runAction))
