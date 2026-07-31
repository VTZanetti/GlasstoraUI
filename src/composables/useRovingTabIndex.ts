import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

export interface UseRovingTabIndexOptions {
  /** The element the items live in. Also where the keydown handler belongs. */
  container: Ref<HTMLElement | null>
  /** Finds the items inside the container. Disabled ones are dropped for you. */
  selector: string
  orientation?: MaybeRefOrGetter<RovingOrientation>
  /** Whether the ends join up. Defaults to true. */
  wrap?: MaybeRefOrGetter<boolean>
  /**
   * 'automatic' activates whatever the arrows land on, which is what radios and
   * tabs do by default. 'manual' waits for Enter or Space.
   */
  activation?: MaybeRefOrGetter<'automatic' | 'manual'>
  /**
   * 'dom' moves the focus onto the item, which is the menu and tablist pattern.
   * 'activedescendant' leaves the focus where it is and only marks the item, so
   * a listbox can be driven from the input or button that owns it.
   */
  focus?: 'dom' | 'activedescendant'
  /** Jump to an item by typing its first letters. Defaults to false. */
  typeahead?: MaybeRefOrGetter<boolean>
  /** The element is the reliable identity; the index is into the enabled items. */
  onActivate?: (element: HTMLElement, index: number) => void
}

export interface UseRovingTabIndexReturn {
  activeIndex: Ref<number>
  /** The id of the active item, for aria-activedescendant. */
  activeId: ComputedRef<string | undefined>
  items: () => HTMLElement[]
  /**
   * Moving the focus brings the item into view with it. Pass `scroll` to ask
   * for that on its own, which is what a listbox left behind by
   * aria-activedescendant needs; leave it alone to only mark the item, which
   * is what syncing a selection to a model does.
   */
  setActive: (index: number, moveFocus?: boolean, scroll?: boolean) => void
  onKeydown: (event: KeyboardEvent) => void
  /** Re-reads the DOM. Call it after the item list changes, past nextTick. */
  refresh: () => void
}

/** How long a typed run keeps building one search before it starts over. */
const TYPEAHEAD_WINDOW = 500

/**
 * One stop on the way in, arrow keys once you are there.
 *
 * The items are read from the DOM rather than registered, because they arrive
 * through a slot or a v-for and document order is already the answer. That is
 * also why the index counts enabled items only and onActivate hands back the
 * element: a caller matching an index against its own array would be wrong the
 * moment one entry is disabled.
 */
export function useRovingTabIndex(options: UseRovingTabIndexOptions): UseRovingTabIndexReturn {
  const activeIndex = ref(0)
  const mode = options.focus ?? 'dom'

  let typed = ''
  let typedTimer: ReturnType<typeof setTimeout> | undefined

  function items(): HTMLElement[] {
    const container = options.container.value
    if (!container) return []
    return [...container.querySelectorAll<HTMLElement>(options.selector)].filter(
      (item) => !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true',
    )
  }

  const activeId = computed(() => {
    // Reading the ref makes this recompute as the selection moves; the id
    // itself has to come from the DOM.
    void activeIndex.value
    return items()[activeIndex.value]?.id || undefined
  })

  function applyTabIndex(list: HTMLElement[]) {
    if (mode !== 'dom') return
    // Exactly one stop, so Tab enters the group and leaves it rather than
    // walking every item.
    list.forEach((item, index) => {
      item.tabIndex = index === activeIndex.value ? 0 : -1
    })
  }

  /**
   * Scrolling follows the focus by default, because the two belong together:
   * the arrow keys move the selection and the item they land on has to be
   * visible. It does not happen on its own, because scrollIntoView scrolls
   * every scrollable ancestor up to the document, so a group that scrolled
   * while merely syncing its selection to a model would pull the page down to
   * itself the moment it rendered.
   */
  function setActive(index: number, moveFocus = false, scroll = moveFocus) {
    const list = items()
    if (!list.length) return
    const clamped = Math.max(0, Math.min(index, list.length - 1))
    activeIndex.value = clamped
    applyTabIndex(list)

    const item = list[clamped]
    if (moveFocus && mode === 'dom') item.focus()
    // Not implemented in jsdom, and never essential to what it does.
    if (scroll) item.scrollIntoView?.({ block: 'nearest' })
  }

  function refresh() {
    const list = items()
    if (!list.length) return
    if (activeIndex.value > list.length - 1) activeIndex.value = list.length - 1
    applyTabIndex(list)
  }

  function step(delta: number) {
    const list = items()
    if (!list.length) return
    const wrap = toValue(options.wrap) ?? true
    let next = activeIndex.value + delta
    if (next < 0) next = wrap ? list.length - 1 : 0
    else if (next > list.length - 1) next = wrap ? 0 : list.length - 1
    move(next)
  }

  function move(index: number) {
    setActive(index, true)
    if ((toValue(options.activation) ?? 'automatic') === 'automatic') activate(index)
  }

  function activate(index: number) {
    const item = items()[index]
    if (item) options.onActivate?.(item, index)
  }

  function search(character: string) {
    const list = items()
    if (!list.length) return

    if (typedTimer) clearTimeout(typedTimer)
    typed += character.toLowerCase()
    typedTimer = setTimeout(() => (typed = ''), TYPEAHEAD_WINDOW)

    // Repeating one letter cycles through the items starting with it, which is
    // what a list of names beginning the same way needs.
    const repeated = typed.length > 1 && [...typed].every((c) => c === typed[0])
    const needle = repeated ? typed[0] : typed
    const from = typed.length === 1 || repeated ? activeIndex.value + 1 : activeIndex.value

    for (let offset = 0; offset < list.length; offset++) {
      const index = (from + offset) % list.length
      const label = (list[index].textContent ?? '').trim().toLowerCase()
      if (label.startsWith(needle)) {
        move(index)
        return
      }
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return

    const orientation = toValue(options.orientation) ?? 'vertical'
    const horizontal = orientation === 'horizontal' || orientation === 'both'
    const vertical = orientation === 'vertical' || orientation === 'both'

    switch (event.key) {
      case 'ArrowRight':
        if (!horizontal) return
        break
      case 'ArrowLeft':
        if (!horizontal) return
        break
      case 'ArrowDown':
        if (!vertical) return
        break
      case 'ArrowUp':
        if (!vertical) return
        break
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        step(1)
        return
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        step(-1)
        return
      case 'Home':
        event.preventDefault()
        move(0)
        return
      case 'End':
        event.preventDefault()
        move(items().length - 1)
        return
      case 'Enter':
      case ' ':
        if ((toValue(options.activation) ?? 'automatic') !== 'manual') return
        event.preventDefault()
        activate(activeIndex.value)
        return
    }

    if ((toValue(options.typeahead) ?? false) && event.key.length === 1 && event.key !== ' ') {
      event.preventDefault()
      search(event.key)
    }
  }

  watch(options.container, () => refresh(), { flush: 'post' })

  onBeforeUnmount(() => {
    if (typedTimer) clearTimeout(typedTimer)
  })

  return { activeIndex, activeId, items, setActive, onKeydown, refresh }
}
