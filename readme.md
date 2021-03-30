# Dirt Version 1 - Unstable

_It's a lot better._

# Example

Create a typescript file in your project somewhere that looks something like this:

```ts
export interface MyTaskParams {
	watch: boolean
}

/** A short description here */
export function myTask(params: MyTaskParams) {
	console.log(`It's my task!  Watch: ${params.watch}`)
}
```

Create an alias for the dirt CLI. Replace `<tasks_file_path>` with the path to the file you created in the last step.

```sh
alias dirt="deno run -A --unstable https://denopkg.com/Vehmloewff/dirt@v1/cli.ts <tasks_file_path>"
```

Run your task.

```
dirt myTask --watch
```
