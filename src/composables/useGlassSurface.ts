import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { registerSurface, type SurfaceHandle, type SurfaceLight } from '../internal/lightRegistry'
import { glassClasses } from '../internal/surfaceClasses'
import type { GlassElevation, GlassRadius } from '../types'

export interface UseGlassSurfaceOptions {
  /** Set to false to take the light without the blur, grain and ring. */
  glass?: MaybeRefOrGetter<boolean>
  /** Fogs the surface up on hover. */
  interactive?: MaybeRefOrGetter<boolean>
  /** Omit to keep whatever elevation the component's own CSS sets. */
  elevation?: MaybeRefOrGetter<GlassElevation | undefined>
  /** Omit to keep whatever radius the component's own CSS sets. */
  radius?: MaybeRefOrGetter<GlassRadius | undefined>
  /** Re-measure every frame. For a surface that moves under its own animation. */
  volatile?: MaybeRefOrGetter<boolean>
  /** Set to false to leave the surface on the viewport space recipe. */
  light?: MaybeRefOrGetter<boolean>
  /** Multiplies the highlight strength of this surface alone. */
  gain?: MaybeRefOrGetter<number>
  /** Set to false on surfaces too small for a border ring to read as anything. */
  ring?: MaybeRefOrGetter<boolean>
  /** Set to false to drop the film grain on this surface. */
  grain?: MaybeRefOrGetter<boolean>
  /** Reuse an existing template ref instead of the one this returns. */
  el?: Ref<HTMLElement | null>
  /** Called after every write. Used by the playground light inspector. */
  onLight?: (light: SurfaceLight) => void
}

export interface UseGlassSurfaceReturn {
  /** The element currently under the light. Read only in practice. */
  surfaceRef: Ref<HTMLElement | null>
  /**
   * Everything the element needs, including its own ref. Spread it with v-bind
   * and there is nothing else to wire up:
   *
   *   <div v-bind="surfaceAttrs">
   */
  surfaceAttrs: ComputedRef<{ class: string[]; ref: (el: unknown) => void }>
  /** Forces a re-measure, for a layout change nothing else can observe. */
  measure: () => void
}

/**
 * Turns an element into a glass surface driven by the shared light.
 *
 * There is deliberately no style binding in the return value. The registry owns
 * the inline --gt-light-* properties on the element and rewrites them up to
 * sixty times a second; handing back a reactive style object would put a second
 * writer on the same el.style and invite a whole class of bug later on.
 */
export function useGlassSurface(options: UseGlassSurfaceOptions = {}): UseGlassSurfaceReturn {
  const surfaceRef = options.el ?? ref<HTMLElement | null>(null)
  let handle: SurfaceHandle | undefined
  let attachedTo: HTMLElement | null = null

  // A function ref rather than a name the template has to repeat. Vue pulls the
  // ref key out of a v-bind object before it reaches the DOM, so one spread
  // carries both the classes and the binding.
  function setSurface(el: unknown) {
    surfaceRef.value = (el as HTMLElement) ?? null
  }

  const surfaceAttrs = computed(() => ({
    ref: setSurface,
    class: glassClasses({
      glass: toValue(options.glass) ?? true,
      interactive: toValue(options.interactive) ?? false,
      elevation: toValue(options.elevation),
      radius: toValue(options.radius),
      ring: toValue(options.ring) ?? true,
      grain: toValue(options.grain) ?? true,
    }),
  }))

  function registerOptions() {
    return {
      volatile: toValue(options.volatile) ?? false,
      gain: toValue(options.gain) ?? 1,
      onUpdate: options.onLight,
    }
  }

  function detach() {
    handle?.release()
    handle = undefined
    attachedTo = null
  }

  // Idempotent on purpose. The function ref, the mounted hook and the option
  // watchers all land here, in an order that depends on the component, and none
  // of them should be able to register the same element twice.
  function attach() {
    const el = surfaceRef.value
    const wantsLight = toValue(options.light) ?? true
    if (!el || !wantsLight) {
      detach()
      return
    }
    if (handle && attachedTo === el) {
      handle.update(registerOptions())
      return
    }
    detach()
    attachedTo = el
    handle = registerSurface(el, registerOptions())
  }

  onMounted(attach)
  watch(surfaceRef, attach, { flush: 'post' })
  watch(
    [() => toValue(options.light), () => toValue(options.volatile), () => toValue(options.gain)],
    attach,
  )
  onBeforeUnmount(detach)

  return {
    surfaceRef,
    surfaceAttrs,
    measure: () => handle?.measure(),
  }
}
