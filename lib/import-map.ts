import { existsSync } from 'https://deno.land/std@0.68.0/fs/mod.ts'

const importMap = Deno.env.get('DIRT_IMPORT_MAP') || '.config/deps.json'
export default () => (existsSync(importMap) ? [`--importmap`, importMap] : [])
