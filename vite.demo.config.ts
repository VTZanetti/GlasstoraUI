import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves the demo from a repository subpath. Hosts that serve from
// the domain root, such as Netlify, Vercel and Cloudflare Pages, only need
// DEMO_BASE=/ in the build environment.
const base = process.env.DEMO_BASE ?? '/GlasstoraUI/'

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
