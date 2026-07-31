import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRovingTabIndex, type UseRovingTabIndexOptions } from '../composables/useRovingTabIndex'

type Item = { label: string; disabled?: boolean }

/** What the harness exposes, already unwrapped the way vm hands it over. */
interface Exposed {
  activeIndex: number
  activeId: string | undefined
  refresh: () => void
  setActive: (index: number, moveFocus?: boolean, scroll?: boolean) => void
}

function harness(items: Item[], options: Partial<UseRovingTabIndexOptions> = {}) {
  const activated: string[] = []
  const list = ref(items)

  const Host = defineComponent({
    setup(_props, { expose }) {
      const container = ref<HTMLElement | null>(null)
      const roving = useRovingTabIndex({
        container,
        selector: '[role="option"]',
        onActivate: (element) => activated.push(element.textContent ?? ''),
        ...options,
      })
      expose(roving)
      return () =>
        h(
          'div',
          { ref: container, onKeydown: roving.onKeydown },
          list.value.map((item) =>
            h(
              'button',
              {
                role: 'option',
                key: item.label,
                id: `opt-${item.label}`,
                ...(item.disabled ? { disabled: true } : {}),
              },
              item.label,
            ),
          ),
        )
    },
  })

  const wrapper = mount(Host, { attachTo: document.body })
  const press = (key: string) => wrapper.find('div').trigger('keydown', { key })
  const tabIndexes = () => wrapper.findAll('button').map((button) => button.attributes('tabindex'))

  return { wrapper, activated, list, press, tabIndexes, vm: wrapper.vm as unknown as Exposed }
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('useRovingTabIndex', () => {
  it('leaves one tab stop and moves it with the arrows', async () => {
    const { wrapper, press, tabIndexes } = harness([
      { label: 'one' },
      { label: 'two' },
      { label: 'three' },
    ])
    await nextTick()

    expect(tabIndexes()).toEqual(['0', '-1', '-1'])

    await press('ArrowDown')
    expect(tabIndexes()).toEqual(['-1', '0', '-1'])
    expect(document.activeElement?.textContent).toBe('two')
    wrapper.unmount()
  })

  it('steps over a disabled item', async () => {
    const { wrapper, press } = harness([
      { label: 'one' },
      { label: 'two', disabled: true },
      { label: 'three' },
    ])
    await nextTick()

    await press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('three')
    wrapper.unmount()
  })

  it('joins the ends up, and stops at them when told not to', async () => {
    const wrapping = harness([{ label: 'one' }, { label: 'two' }])
    await nextTick()
    await wrapping.press('ArrowUp')
    expect(document.activeElement?.textContent).toBe('two')
    wrapping.wrapper.unmount()

    const clamped = harness([{ label: 'one' }, { label: 'two' }], { wrap: false })
    await nextTick()
    await clamped.press('ArrowUp')
    expect(document.activeElement?.textContent).toBe('one')
    clamped.wrapper.unmount()
  })

  it('ignores the axis it was not given', async () => {
    const { wrapper, press, vm } = harness([{ label: 'one' }, { label: 'two' }], {
      orientation: 'horizontal',
    })
    await nextTick()

    await press('ArrowDown')
    expect(vm.activeIndex).toBe(0)
    await press('ArrowRight')
    expect(vm.activeIndex).toBe(1)
    wrapper.unmount()
  })

  it('goes to the ends with Home and End', async () => {
    const { wrapper, press, vm } = harness([{ label: 'one' }, { label: 'two' }, { label: 'three' }])
    await nextTick()

    await press('End')
    expect(vm.activeIndex).toBe(2)
    await press('Home')
    expect(vm.activeIndex).toBe(0)
    wrapper.unmount()
  })

  it('activates on the move by default and waits for Enter when manual', async () => {
    const automatic = harness([{ label: 'one' }, { label: 'two' }])
    await nextTick()
    await automatic.press('ArrowDown')
    expect(automatic.activated).toEqual(['two'])
    automatic.wrapper.unmount()

    const manual = harness([{ label: 'one' }, { label: 'two' }], { activation: 'manual' })
    await nextTick()
    await manual.press('ArrowDown')
    expect(manual.activated).toEqual([])
    await manual.press('Enter')
    expect(manual.activated).toEqual(['two'])
    manual.wrapper.unmount()
  })

  it('leaves the focus alone when it only marks the item', async () => {
    const { wrapper, press, tabIndexes, vm } = harness([{ label: 'one' }, { label: 'two' }], {
      focus: 'activedescendant',
    })
    await nextTick()

    await press('ArrowDown')
    expect(vm.activeId).toBe('opt-two')
    expect(document.activeElement?.textContent).not.toBe('two')
    // No tab stops to manage: whatever owns the list keeps the focus.
    expect(tabIndexes()).toEqual([undefined, undefined])
    wrapper.unmount()
  })

  it('jumps to an item by typing', async () => {
    vi.useFakeTimers()
    const { wrapper, press, vm } = harness(
      [{ label: 'apple' }, { label: 'banana' }, { label: 'apricot' }],
      { typeahead: true },
    )
    await nextTick()

    await press('b')
    expect(vm.activeIndex).toBe(1)

    // Keys typed inside the window build one search, so apr picks the apricot
    // rather than landing back on the apple.
    vi.advanceTimersByTime(600)
    await press('a')
    await press('p')
    await press('r')
    expect(vm.activeIndex).toBe(2)
    wrapper.unmount()
  })

  it('starts a fresh search once the window has passed', async () => {
    vi.useFakeTimers()
    const { wrapper, press, vm } = harness([{ label: 'apple' }, { label: 'banana' }], {
      typeahead: true,
    })
    await nextTick()

    await press('b')
    await press('a')
    // Still one search: ba matches the banana it is already on.
    expect(vm.activeIndex).toBe(1)

    vi.advanceTimersByTime(600)
    await press('a')
    expect(vm.activeIndex).toBe(0)
    wrapper.unmount()
  })

  it('cycles through the items sharing a letter when it is repeated', async () => {
    vi.useFakeTimers()
    const { wrapper, press, vm } = harness(
      [{ label: 'apple' }, { label: 'banana' }, { label: 'apricot' }],
      { typeahead: true },
    )
    await nextTick()

    await press('a')
    expect(vm.activeIndex).toBe(2)
    await press('a')
    expect(vm.activeIndex).toBe(0)
    await press('a')
    expect(vm.activeIndex).toBe(2)
    wrapper.unmount()
  })

  it('pulls the active index back inside a list that shrank', async () => {
    const { wrapper, press, list, vm } = harness([
      { label: 'one' },
      { label: 'two' },
      { label: 'three' },
    ])
    await nextTick()

    await press('End')
    expect(vm.activeIndex).toBe(2)

    list.value = [{ label: 'one' }]
    await nextTick()
    vm.refresh()

    expect(vm.activeIndex).toBe(0)
    expect(wrapper.find('button').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  // scrollIntoView scrolls every scrollable ancestor, the document included, so
  // a component that called it while merely syncing its selection would drag
  // the page down to itself the moment it rendered.
  describe('scrolling', () => {
    // jsdom implements no scrollIntoView, which is why the call in setActive is
    // optional. Lending the prototype one is what makes the difference between
    // "scrolled" and "did not" visible to a test at all.
    function spyOnScroll() {
      const spy = vi.fn()
      const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
      Element.prototype.scrollIntoView = spy
      return {
        spy,
        restore: () => {
          if (original) Object.defineProperty(Element.prototype, 'scrollIntoView', original)
          else delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
        },
      }
    }

    const three = [{ label: 'one' }, { label: 'two' }, { label: 'three' }]

    it('stays put when the selection is only being synced', async () => {
      const { spy, restore } = spyOnScroll()
      try {
        const { wrapper, vm } = harness(three)
        await nextTick()

        vm.setActive(2)

        expect(vm.activeIndex).toBe(2)
        expect(spy).not.toHaveBeenCalled()
        wrapper.unmount()
      } finally {
        restore()
      }
    })

    it('brings into view the item it moves the focus to', async () => {
      const { spy, restore } = spyOnScroll()
      try {
        const { wrapper, press } = harness(three)
        await nextTick()

        await press('ArrowDown')

        expect(spy).toHaveBeenCalledTimes(1)
        wrapper.unmount()
      } finally {
        restore()
      }
    })

    // A listbox driven by aria-activedescendant leaves the focus in the input,
    // so it has to ask for the scroll on its own behalf.
    it('scrolls without the focus when it is asked to', async () => {
      const { spy, restore } = spyOnScroll()
      try {
        const { wrapper, vm } = harness(three, { focus: 'activedescendant' })
        await nextTick()

        vm.setActive(2, false, true)

        expect(spy).toHaveBeenCalledTimes(1)
        wrapper.unmount()
      } finally {
        restore()
      }
    })
  })
})
