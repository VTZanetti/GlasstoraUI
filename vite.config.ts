import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

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
          }),
        ]
      : []),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'Glasstora',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'glasstora.js' : 'glasstora.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      output: { globals: { vue: 'Vue' } },
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
