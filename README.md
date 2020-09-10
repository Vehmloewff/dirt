# Dirt CLI

Simply runs the dirt tasks file. This defaults to `.config/tasks.ts`, but can be overridden with the `DIRT_TASKS_FILE` environment variable. By default the importmap is set to `.config/deps.json`, but this too can be changed with the `DIRT_IMPORT_MAP` environment variable.

## Installation

```sh
deno install --unstable --allow-run https://raw.githubusercontent.com/Vehmloewff/dirt-cli/master/dirt.ts
```
