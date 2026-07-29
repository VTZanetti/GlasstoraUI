import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export interface UseDismissableOptions {
  /** Only listens while this is true. */
  open: MaybeRefOrGetter<boolean>
  /** Elements that count as inside. A click in any of them is not a dismissal. */
  inside: Ref<HTMLElement | null>[]
  onDismiss: () => void
  escape?: MaybeRefOrGetter<boolean>
  outside?: MaybeRefOrGetter<boolean>
}

/**
 * Closes a layer on Escape or on a click outside it.
 *
 * Pointerdown rather than click, because a click that starts inside the panel
 * and ends outside it (selecting text and releasing past the edge) fires its
 * click on a common ancestor and would otherwise read as a dismissal.
 */
export function useDismissable(options: UseDismissableOptions): void {
  let listening = false

  function isInside(target: Node | null): boolean {
    if (!target) return false
    return options.inside.some((ref) => ref.value?.contains(target))
  }

  function onPointerDown(event: Event) {
    if (!(toValue(options.outside) ?? true)) return
    if (isInside(event.target as Node)) return
    options.onDismiss()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    if (!(toValue(options.escape) ?? true)) return
    event.stopPropagation()
    options.onDismiss()
  }

  function start() {
    if (listening || typeof document === 'undefined') return
    listening = true
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeydown)
  }

  function stop() {
    if (!listening || typeof document === 'undefined') return
    listening = false
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('keydown', onKeydown)
  }

  watch(
    () => toValue(options.open),
    (open) => (open ? start() : stop()),
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(stop)
}
