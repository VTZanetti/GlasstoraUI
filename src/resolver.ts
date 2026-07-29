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
}

export interface ComponentResolveResult {
  name: string
  from: string
  sideEffects?: string[]
}

const PACKAGE = 'glasstora'
const STYLE = 'glasstora/style.css'

export function GlasstoraResolver(options: GlasstoraResolverOptions = {}) {
  const prefix = options.prefix ?? 'Glass'
  const pattern = new RegExp(`^${prefix}[A-Z]`)

  return {
    type: 'component' as const,
    resolve(name: string): ComponentResolveResult | undefined {
      if (!pattern.test(name)) return undefined
      const exported =
        prefix === 'Glass' ? name : name.replace(pattern, (m) => `Glass${m.slice(prefix.length)}`)
      // The stylesheet is a single file for the whole library, so every
      // resolved component points at the same one. The bundler deduplicates it.
      return { name: exported, from: PACKAGE, sideEffects: [STYLE] }
    },
  }
}
