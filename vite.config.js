import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.ts'

export default defineConfig({
    plugins: [crx({ manifest })],
    server: { port: 3000, hmr: { port: 3000 } }
})
