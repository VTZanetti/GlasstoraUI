/**
 * Resolver for unplugin-vue-components.
 *
 *   import { GlasstoraResolver } from 'glasstora/resolver'
 *
 *   Components({ resolvers: [GlasstoraResolver()] })
 *
 * This module runs inside the bundler, not in the browser, so it must not
 * import Vue, the components or the stylesheet. It is a name test and a string.
 */

export interface GlasstoraResolverOptions {
  /**
   * Prefix the templates use. Defaults to the component names as published.
   * Set it to match a prefix passed to the install plugin.
   */
  prefix?: string
  /**
   * Which stylesheets a resolved component pulls in.
   *
   * 'split' is the default: the shared base plus the file for that component,
   * so a page carries the styles of what it renders. 'bundle' points every
   * component at the single stylesheet, which is what 0.2.0 did and what a
   * build that cannot resolve subpath exports still needs.
   */
  css?: 'split' | 'bundle'
}

export interface ComponentResolveResult {
  name: string
  from: string
  sideEffects?: string[]
}

const PACKAGE = 'glasstora'
const BUNDLE = 'glasstora/style.css'
const BASE = 'glasstora/css/base.css'

/**
 * Components that render another component. The JavaScript comes along through
 * the barrel, but the stylesheet has to be named here or the inner component
 * renders unstyled. Keep this in step with the imports in src/components; the
 * dist check walks both and fails when they disagree.
 */
const DEPENDENCIES: Record<string, readonly string[]> = {
  GlassButton: ['GlassSpinner'],
}

export function GlasstoraResolver(options: GlasstoraResolverOptions = {}) {
  const prefix = options.prefix ?? 'Glass'
  const mode = options.css ?? 'split'
  const pattern = new RegExp(`^${prefix}[A-Z]`)

  return {
    type: 'component' as const,
    resolve(name: string): ComponentResolveResult | undefined {
      if (!pattern.test(name)) return undefined
      const exported =
        prefix === 'Glass' ? name : name.replace(pattern, (m) => `Glass${m.slice(prefix.length)}`)

      if (mode === 'bundle') {
        return { name: exported, from: PACKAGE, sideEffects: [BUNDLE] }
      }

      // The base comes first so the cascade layer takes its position from it
      // rather than from whichever component the bundler happens to emit first.
      const sideEffects = [
        BASE,
        ...(DEPENDENCIES[exported] ?? []).map((dep) => `${PACKAGE}/css/${dep}.css`),
        `${PACKAGE}/css/${exported}.css`,
      ]
      return { name: exported, from: PACKAGE, sideEffects }
    },
  }
}
