import type { DirectiveBinding, ObjectDirective } from 'vue'
import { registerSurface, type SurfaceHandle } from '../internal/lightRegistry'
import { glassClasses, type SurfaceClassOptions } from '../internal/surfaceClasses'

export interface GlassDirectiveValue extends SurfaceClassOptions {
  /** Re-measure every frame, for an element that moves under its own animation. */
  volatile?: boolean
  /** Set to false to leave the element on the viewport space recipe. */
  light?: boolean
  /** Multiplies the highlight strength of this element alone. */
  gain?: number
}

type Binding = DirectiveBinding<GlassDirectiveValue | undefined>

const handles = new WeakMap<HTMLElement, SurfaceHandle>()
const applied = new WeakMap<HTMLElement, string[]>()

/**
 * Modifiers are fixed at compile time, so they carry the booleans, and the
 * value carries anything that changes at runtime. Where both name the same
 * thing the value wins, since it is the one that can react.
 */
function resolve(binding: Binding): GlassDirectiveValue {
  const { modifiers, value } = binding
  const resolved: GlassDirectiveValue = {
    interactive: modifiers.interactive || undefined,
    volatile: modifiers.volatile || undefined,
    elevation: modifiers.flat ? 0 : undefined,
    light: modifiers['no-light'] ? false : undefined,
    ring: modifiers['no-ring'] ? false : undefined,
    grain: modifiers['no-grain'] ? false : undefined,
  }

  if (value) {
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) resolved[key as keyof GlassDirectiveValue] = entry
    }
  }

  return resolved
}

function apply(el: HTMLElement, binding: Binding): void {
  const options = resolve(binding)

  const previous = applied.get(el)
  if (previous) el.classList.remove(...previous)
  const classes = glassClasses(options)
  el.classList.add(...classes)
  applied.set(el, classes)

  const wantsLight = options.light ?? true
  const existing = handles.get(el)

  if (!wantsLight) {
    existing?.release()
    handles.delete(el)
    return
  }

  const registerOptions = { volatile: options.volatile ?? false, gain: options.gain ?? 1 }
  if (existing) existing.update(registerOptions)
  else handles.set(el, registerSurface(el, registerOptions))
}

/**
 * Makes any element a glass surface.
 *
 *   v-glass
 *   v-glass="{ elevation: 2, radius: 'lg', gain: 1.4 }"
 *   v-glass.interactive.volatile
 *   v-glass.no-light
 */
export const vGlass: ObjectDirective<HTMLElement, GlassDirectiveValue | undefined> = {
  mounted: apply,
  updated: apply,
  beforeUnmount(el) {
    handles.get(el)?.release()
    handles.delete(el)
    const classes = applied.get(el)
    if (classes) el.classList.remove(...classes)
    applied.delete(el)
  },
  /**
   * Without this the server renders a bare element and the client adds the
   * glass classes after hydration, which is both a mismatch warning and a
   * visible flash of unstyled surface.
   */
  getSSRProps(binding) {
    return { class: glassClasses(resolve(binding as Binding)).join(' ') }
  },
}
