import 'https://deno.land/x/hackle/init.ts'
import { Application } from 'https://deno.land/x/oak/mod.ts'

const app = new Application()

app.use(ctx => {
	ctx.response.body = 'Hello World!'
})

hackle.info('Running server on port 3000.')

await app.listen({ port: 3000 })
