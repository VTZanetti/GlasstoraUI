import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// Read rather than imported. A JSON import would inline the whole manifest into
// the bundle just to reach one string.
const { version } = createRequire(import.meta.url)('./package.json') as { version: string }

const entry = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url))

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === 'build'
      ? [
          dts({
            include: ['src'],
            exclude: ['src/tests'],
            tsconfigPath: './tsconfig.json',
            rollupTypes: false,
            // src/global.d.ts is already a declaration, so there is nothing to
            // generate from it. Without this it never reaches dist and the
            // ./global export points at a file that does not exist.
            copyDtsFiles: true,
          }),
        ]
      : []),
  ],
  define: {
    __GLASSTORA_VERSION__: JSON.stringify(version),
  },
  build: {
    lib: {
      // The plugin and the resolver are separate entry points on purpose. The
      // plugin references every component, so importing it from the barrel
      // would make tree shaking depend on the bundler proving the reference is
      // dead. The resolver has to stay importable by build tooling that must
      // never load Vue or the stylesheet.
      entry: {
        index: entry('index.ts'),
        plugin: entry('plugin.ts'),
        resolver: entry('resolver.ts'),
      },
      name: 'Glasstora',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        entryName === 'index'
          ? format === 'es'
            ? 'glasstora.js'
            : 'glasstora.cjs'
          : `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      // Named only. A default export alongside named ones makes the CommonJS
      // build reachable as Glasstora.default, which is not what anyone means.
      output: { globals: { vue: 'Vue' }, exports: 'named' },
    },
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.spec.ts'],
    setupFiles: ['./src/tests/setup.ts'],
  },
}))
