import { readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

// Second build pass, run after the library build and writing into the same
// dist. The library build still emits dist/style.css with everything in it;
// this pass adds dist/css, one file per component plus the shared base, so the
// resolver can import only what a page actually renders.
//
// Splitting cannot come from the library build itself: Vite splits CSS per JS
// chunk, and the library is a single chunk containing all the components.

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))
const componentsDir = fileURLToPath(new URL('./src/components', import.meta.url))

// Discovered rather than listed, so a new component with a sibling stylesheet
// is split without touching this file.
const components = Object.fromEntries(
  readdirSync(componentsDir)
    .filter((file) => file.endsWith('.css'))
    .map((file) => [file.replace(/\.css$/, ''), src(`components/${file}`)]),
)

// A CSS entry still produces an empty JavaScript chunk. It has no importer and
// nothing to run, so it is dropped rather than shipped.
function dropCssEntryStubs(): Plugin {
  return {
    name: 'glasstora:drop-css-entry-stubs',
    generateBundle(_options, bundle) {
      for (const [file, output] of Object.entries(bundle)) {
        if (output.type === 'chunk' && output.facadeModuleId?.endsWith('.css')) {
          delete bundle[file]
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [dropCssEntryStubs()],
  build: {
    outDir: 'dist/css',
    // Owns its directory, so emptying it clears the stylesheet of a component
    // that was renamed or removed. The library build runs first and empties the
    // whole of dist, which is why this pass has to come second.
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      input: { base: src('styles/index.css'), ...components },
      output: { assetFileNames: '[name][extname]', entryFileNames: '[name].js' },
    },
  },
})
