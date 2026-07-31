/**
 * Checks the built package before it is published.
 *
 *   npm run build && npm run check:dist
 *
 * Four things can go wrong once the stylesheet is split per component, and none
 * of them fail the build on their own:
 *
 *   - a component ships without its stylesheet, so it renders unstyled for
 *     anyone using the resolver;
 *   - a rule lands outside the glasstora cascade layer, where it beats the
 *     application instead of losing to it;
 *   - the split and the single stylesheet drift apart, so which one a consumer
 *     imports changes what they see;
 *   - the resolver names a file that is not in the package.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')
const distCss = join(dist, 'css')
const componentsDir = join(root, 'src', 'components')

const failures = []
const fail = (message) => failures.push(message)

/** Class names a stylesheet mentions, without the leading dot. */
function classNames(css) {
  return new Set([...css.matchAll(/\.(gt-[a-zA-Z0-9_-]+)/g)].map((match) => match[1]))
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Everything at the top level of a stylesheet that is not the glasstora layer.
 *
 * @property registrations are deliberately unlayered: a layer would add nothing
 * to a registration, and putting them in one only makes them harder to find. A
 * bare @layer statement is the declaration that fixes the layer's position.
 * Anything else at the top level is what this is looking for.
 */
function outsideLayer(css) {
  const source = stripComments(css)
  const leftovers = []
  let index = 0

  while (index < source.length) {
    const start = index
    // Read a prelude up to whichever terminator comes first.
    while (index < source.length && source[index] !== '{' && source[index] !== ';') index++
    const prelude = source.slice(start, index).trim()

    if (index >= source.length) {
      if (prelude) leftovers.push(prelude)
      break
    }

    if (source[index] === ';') {
      index++
      // @charset and @layer statements carry no rules.
      if (!/^@(charset|layer|import)\b/.test(prelude)) if (prelude) leftovers.push(prelude)
      continue
    }

    // Walk the balanced block that follows the prelude.
    let depth = 0
    const blockStart = index
    do {
      if (source[index] === '{') depth++
      else if (source[index] === '}') depth--
      index++
    } while (index < source.length && depth > 0)

    const isLayer = /^@layer\s+glasstora$/.test(prelude)
    const isProperty = /^@property\s+--gt-[\w-]+$/.test(prelude)
    if (!isLayer && !isProperty) leftovers.push(prelude + source.slice(blockStart, index))
  }

  return leftovers
}

// --- the package is built ------------------------------------------------

if (!existsSync(dist)) {
  console.error('dist is missing. Run npm run build first.')
  process.exit(1)
}

const bundlePath = join(dist, 'style.css')
if (!existsSync(bundlePath)) fail('dist/style.css is missing.')
if (!existsSync(join(distCss, 'base.css'))) fail('dist/css/base.css is missing.')

// --- every component ships a stylesheet ----------------------------------

const components = readdirSync(componentsDir)
  .filter((file) => file.endsWith('.vue'))
  .map((file) => file.replace(/\.vue$/, ''))

for (const name of components) {
  const path = join(distCss, `${name}.css`)
  if (!existsSync(path)) {
    fail(`dist/css/${name}.css is missing, so ${name} ships without its styles.`)
    continue
  }
  if (readFileSync(path, 'utf8').trim() === '') fail(`dist/css/${name}.css is empty.`)
}

// --- nothing escapes the cascade layer -----------------------------------

const sheets = existsSync(distCss)
  ? readdirSync(distCss)
      .filter((file) => file.endsWith('.css'))
      .map((file) => [`dist/css/${file}`, join(distCss, file)])
  : []
if (existsSync(bundlePath)) sheets.push(['dist/style.css', bundlePath])

for (const [label, path] of sheets) {
  for (const rule of outsideLayer(readFileSync(path, 'utf8'))) {
    if (rule.includes('.gt-')) {
      fail(`${label} has a rule outside @layer glasstora: ${rule.slice(0, 120)}`)
    }
  }
}

// --- the split and the bundle agree --------------------------------------

if (existsSync(bundlePath) && existsSync(distCss)) {
  const bundle = classNames(readFileSync(bundlePath, 'utf8'))
  const split = new Set()
  const owners = new Map()

  for (const file of readdirSync(distCss).filter((f) => f.endsWith('.css'))) {
    for (const name of classNames(readFileSync(join(distCss, file), 'utf8'))) {
      split.add(name)
      if (!bundle.has(name))
        fail(`dist/css/${file} styles .${name}, which dist/style.css does not.`)
      // Base carries the cross cutting rules, so it is expected to name classes
      // the components own. Two components naming the same one is a copy paste.
      if (file === 'base.css') continue
      const owner = owners.get(name)
      if (owner) fail(`.${name} is styled by both dist/css/${owner} and dist/css/${file}.`)
      else owners.set(name, file)
    }
  }

  for (const name of bundle) {
    if (!split.has(name)) fail(`dist/style.css styles .${name}, which no split stylesheet does.`)
  }
}

// --- the resolver points at files that exist -----------------------------

const resolverPath = join(dist, 'resolver.js')
if (!existsSync(resolverPath)) {
  fail('dist/resolver.js is missing.')
} else {
  const { GlasstoraResolver } = await import(new URL(`file://${resolverPath}`).href)
  for (const mode of ['split', 'bundle']) {
    const resolver = GlasstoraResolver({ css: mode })
    for (const name of components) {
      const result = resolver.resolve(name)
      if (!result) {
        fail(`the resolver does not resolve ${name}.`)
        continue
      }
      for (const effect of result.sideEffects ?? []) {
        const relative = effect.replace(/^glasstora\//, '')
        if (!existsSync(join(dist, relative))) {
          fail(`the resolver sends ${name} to ${effect}, which is not in the package.`)
        }
      }
    }
  }
}

// --- report ---------------------------------------------------------------

if (failures.length) {
  console.error(`check-dist found ${failures.length} problem(s):\n`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(
  `check-dist: ${components.length} components, ${sheets.length} stylesheets, layer and resolver intact.`,
)
