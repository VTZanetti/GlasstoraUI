import type { GlassElevation, GlassRadius } from '../types'

export interface SurfaceClassOptions {
  /**
   * Set to false to take the light without the glass. The element is still
   * driven by the registry and still gets the per surface custom properties,
   * it just skips the blur, the grain and the ring. Small opaque pieces like
   * GlassKbd use this: they belong to the same light, but a backdrop filter on
   * something twenty pixels tall reads as mush.
   */
  glass?: boolean
  interactive?: boolean
  /** Omitted means the component keeps whatever elevation its own CSS sets. */
  elevation?: GlassElevation
  /** Omitted means the component keeps whatever radius its own CSS sets. */
  radius?: GlassRadius
  ring?: boolean
  grain?: boolean
}

/**
 * The single source of truth for what makes an element a glass surface.
 *
 * useGlassSurface, the v-glass directive and the directive's getSSRProps all
 * read from here, so the markup the server writes and the markup the client
 * applies cannot drift apart.
 */
export function glassClasses(options: SurfaceClassOptions = {}): string[] {
  const lit = options.glass === false
  const classes = [lit ? 'gt-lit' : 'gt-glass']
  if (!lit) {
    if (options.interactive) classes.push('gt-glass--interactive')
    if (options.ring === false) classes.push('gt-glass--no-ring')
    if (options.grain === false) classes.push('gt-glass--no-grain')
  }
  if (options.elevation !== undefined) classes.push(`gt-elev-${options.elevation}`)
  if (options.radius !== undefined) classes.push(`gt-r-${options.radius}`)
  return classes
}
