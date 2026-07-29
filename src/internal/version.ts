/**
 * The package version, replaced at build time.
 *
 * Declared here rather than in a root env.d.ts because vite-plugin-dts runs its
 * own TypeScript program over src alone and would not see a declaration living
 * outside it. Keeping it module scoped also stops the name leaking into the
 * global type space of anyone who installs the package.
 *
 * The typeof guard is what lets the source be consumed directly, which the demo
 * does through a path alias: there is no define step in that build, and typeof
 * on an undeclared name is the one way to ask without throwing.
 */
declare const __GLASSTORA_VERSION__: string

export const VERSION: string =
  typeof __GLASSTORA_VERSION__ === 'string' ? __GLASSTORA_VERSION__ : '0.0.0-dev'
