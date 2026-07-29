import { inject } from 'vue'
import { configKey, type GlassConfig } from '../internal/keys'

const FALLBACK: GlassConfig = { grain: true, refraction: 'auto', theme: 'dark' }

/**
 * Reads the settings of the nearest GlassProvider.
 *
 * The object is reactive, so a component that reads config.grain re-renders
 * when the provider's prop changes. In 0.1.0 the provider handed out a plain
 * snapshot and nothing was exposed to inject it with, which made the whole
 * thing unusable; this is the consumer side that was missing.
 */
export function useGlassConfig(): GlassConfig {
  return inject(configKey, FALLBACK)
}
