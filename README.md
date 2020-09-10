# Dirt CLI

Cli for [Dirt](https://github.com/Vehmloewff/dirt).

Simply runs the dirt tasks file. This defaults to `.config/tasks.ts`, but can be overridden with the `DIRT_TASKS_FILE` environment variable. By default the importmap is set to `.config/deps.json`, but this too can be changed with the `DIRT_IMPORT_MAP` environment variable.

## Installation

```sh
deno install --allow-read --allow-run --allow-env --unstable https://deno.land/x/dirt-cli/dirt.ts
```

```sh
Usage: dirt [task] [options]
```
