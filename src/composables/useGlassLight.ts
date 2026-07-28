import { inject, ref } from 'vue'
import { lightKey, type GlassLight, type GlassLightMode } from '../internal/keys'

let warned = false

function createStub(): GlassLight {
  return {
    x: ref(0),
    y: ref(0),
    mode: ref<GlassLightMode>('static'),
    set: () => {},
    resume: () => {},
  }
}

/** Reactive access to the global light source provided by GlassProvider. */
export function useGlassLight(): GlassLight {
  const light = inject(lightKey, null)
  if (light) return light
  if (!warned && typeof console !== 'undefined') {
    console.warn('[glasstora] useGlassLight() found no GlassProvider. Falling back to a stub.')
    warned = true
  }
  return createStub()
}
