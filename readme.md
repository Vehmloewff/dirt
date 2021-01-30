```ts
import * as dirt from 'https://deno.land/x/dirt/mod.ts'

export interface HelloParams {
	/** @default true */
	watch?: boolean
}

/** Say hello to your favorite character */
export function hello(params: HelloParams) {}
```
