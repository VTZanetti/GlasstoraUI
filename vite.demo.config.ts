import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The demo is served from the domain root. Hosts that serve it from a subpath
// need that subpath in the build environment, such as DEMO_BASE=/glasstora/.
const base = process.env.DEMO_BASE ?? '/'

// The demo consumes the library from source through an alias, so it has to
// define the same build constant the library build does. Without it the page
// would fall back to the placeholder version.
const { version } = createRequire(import.meta.url)('./package.json') as { version: string }

export default defineConfig(({ command }) => ({
  root: 'playground',
  base: command === 'build' ? base : '/',
  plugins: [vue()],
  define: {
    __GLASSTORA_VERSION__: JSON.stringify(version),
  },
  resolve: {
    // The stylesheet entry comes first, because the bare specifier would
    // otherwise swallow it and resolve to src/index.ts/style.css.
    alias: [
      {
        find: 'glasstora/style.css',
        replacement: fileURLToPath(new URL('./src/styles/index.css', import.meta.url)),
      },
      {
        find: 'glasstora',
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
    ],
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-demo', import.meta.url)),
    emptyOutDir: true,
  },
}))
