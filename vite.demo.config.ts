import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The demo is served from the domain root. Hosts that serve it from a subpath
// need that subpath in the build environment, such as DEMO_BASE=/glasstora/.
const base = process.env.DEMO_BASE ?? '/'

export default defineConfig(({ command }) => ({
  root: 'playground',
  base: command === 'build' ? base : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      glasstora: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-demo', import.meta.url)),
    emptyOutDir: true,
  },
}))
