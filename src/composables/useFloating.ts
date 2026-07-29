import { onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { computeFloatingPosition } from '../internal/floatingMath'
import type { GlassPlacement } from '../types'

export interface UseFloatingOptions {
  placement?: MaybeRefOrGetter<GlassPlacement>
  offset?: MaybeRefOrGetter<number>
  padding?: MaybeRefOrGetter<number>
  /** Nothing is tracked while this is false. */
  open?: MaybeRefOrGetter<boolean>
  /** Called when the anchor scrolls out of a clipping container. */
  onHidden?: () => void
}

export interface UseFloatingReturn {
  anchorRef: Ref<HTMLElement | null>
  floatingRef: Ref<HTMLElement | null>
  /** Spread onto the trigger with v-bind. Carries the anchor's ref. */
  anchorAttrs: { ref: (el: unknown) => void }
  /** The placement in use, which differs from the request after a flip. */
  placement: Ref<GlassPlacement>
  update: () => void
}

/**
 * Positions a floating panel against an anchor.
 *
 * The panel writes its own transform rather than going through a reactive style
 * binding: this runs on every scroll frame, and a render pass per frame to move
 * one element is waste that shows up on a long page.
 */
export function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
  const anchorRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)
  const placement = ref<GlassPlacement>(toValue(options.placement) ?? 'bottom')

  let frame = 0
  let listening = false
  let clipObserver: IntersectionObserver | null = null

  function apply() {
    frame = 0
    const anchor = anchorRef.value
    const floating = floatingRef.value
    if (!anchor || !floating) return

    // Read both boxes, then write once.
    const anchorRect = anchor.getBoundingClientRect()
    const floatingRect = floating.getBoundingClientRect()

    const result = computeFloatingPosition(
      anchorRect,
      { width: floatingRect.width, height: floatingRect.height },
      { width: window.innerWidth, height: window.innerHeight },
      {
        placement: toValue(options.placement) ?? 'bottom',
        offset: toValue(options.offset) ?? 8,
        padding: toValue(options.padding) ?? 8,
      },
    )

    floating.style.transform = `translate3d(${Math.round(result.x)}px, ${Math.round(result.y)}px, 0)`
    if (result.placement !== placement.value) placement.value = result.placement
  }

  function update() {
    if (frame || typeof window === 'undefined') return
    frame = window.requestAnimationFrame(apply)
  }

  function start() {
    if (listening || typeof window === 'undefined') return
    listening = true
    // Capture phase catches scrolling in any container without walking the
    // anchor's ancestors looking for scroll parents.
    document.addEventListener('scroll', update, { capture: true, passive: true })
    window.addEventListener('resize', update, { passive: true })

    // Viewport collision cannot tell that an anchor scrolled out of a container
    // with its own overflow. This can.
    if (options.onHidden && anchorRef.value && typeof IntersectionObserver !== 'undefined') {
      clipObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) if (!entry.isIntersecting) options.onHidden?.()
        },
        { threshold: 0 },
      )
      clipObserver.observe(anchorRef.value)
    }

    update()
  }

  function stop() {
    if (frame && typeof window !== 'undefined') window.cancelAnimationFrame(frame)
    frame = 0
    if (!listening || typeof window === 'undefined') return
    listening = false
    document.removeEventListener('scroll', update, { capture: true })
    window.removeEventListener('resize', update)
    clipObserver?.disconnect()
    clipObserver = null
  }

  watch(
    [() => toValue(options.open) ?? true, floatingRef],
    ([open, floating]) => {
      if (open && floating) start()
      else stop()
    },
    { flush: 'post' },
  )

  watch([() => toValue(options.placement), () => toValue(options.offset)], update)

  onBeforeUnmount(stop)

  const anchorAttrs = {
    ref: (el: unknown) => {
      anchorRef.value = (el as HTMLElement) ?? null
    },
  }

  return { anchorRef, floatingRef, anchorAttrs, placement, update }
}
