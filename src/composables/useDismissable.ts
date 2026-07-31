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
 * Every open layer, oldest first.
 *
 * Escape and a click outside belong to the topmost one alone. Without this each
 * layer listens on the document independently and they all answer at once, so a
 * menu opened inside a modal would take the modal down with it. Worse, the
 * menu's panel is teleported to the body and therefore outside the modal's
 * panel, so clicking a menu item read as a click outside the modal.
 */
const stack: symbol[] = []

/**
 * Closes a layer on Escape or on a click outside it.
 *
 * Pointerdown rather than click, because a click that starts inside the panel
 * and ends outside it (selecting text and releasing past the edge) fires its
 * click on a common ancestor and would otherwise read as a dismissal.
 */
export function useDismissable(options: UseDismissableOptions): void {
  const token = Symbol('gt-layer')
  let listening = false

  const isTopmost = () => stack[stack.length - 1] === token

  function isInside(target: Node | null): boolean {
    if (!target) return false
    return options.inside.some((ref) => ref.value?.contains(target))
  }

  function onPointerDown(event: Event) {
    if (!isTopmost()) return
    if (!(toValue(options.outside) ?? true)) return
    if (isInside(event.target as Node)) return
    options.onDismiss()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    if (!isTopmost()) return
    if (!(toValue(options.escape) ?? true)) return
    event.stopPropagation()
    options.onDismiss()
  }

  function start() {
    if (listening || typeof document === 'undefined') return
    listening = true
    stack.push(token)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeydown)
  }

  function stop() {
    if (!listening || typeof document === 'undefined') return
    listening = false
    const index = stack.lastIndexOf(token)
    if (index !== -1) stack.splice(index, 1)
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

/** How many layers are open. Exposed for tests. */
export function dismissableDepth(): number {
  return stack.length
}
