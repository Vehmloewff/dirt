import { existsSync } from 'fs'

const importMap = Deno.env.get('DIRT_IMPORT_MAP') || '.config/deps.json'
export default () => (existsSync(importMap) ? [`--importmap`, importMap] : [])
