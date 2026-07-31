import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassTabPanel, GlassTabs, type GlassTabItem } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const TABS: GlassTabItem[] = [
  { label: 'first', value: 'one' },
  { label: 'second', value: 'two' },
  { label: 'third', value: 'three' },
]

function mountTabs(props: Record<string, unknown> = {}, tabs: GlassTabItem[] = TABS) {
  return mount(GlassTabs, {
    props: { tabs, ...props },
    slots: {
      default: () =>
        tabs.map((tab) => h(GlassTabPanel, { value: tab.value, key: tab.value }, () => tab.label)),
    },
    attachTo: document.body,
  })
}

const tabs = (w: VueWrapper) => w.findAll('[role="tab"]')
const selected = (w: VueWrapper) =>
  tabs(w).findIndex((tab) => tab.attributes('aria-selected') === 'true')

describe('GlassTabs', () => {
  it('is a tablist and starts on the first tab', async () => {
    wrapper = mountTabs()
    await nextTick()

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(tabs(wrapper)).toHaveLength(3)
    expect(selected(wrapper)).toBe(0)
  })

  it('starts on the first tab that is not disabled', async () => {
    wrapper = mountTabs({}, [{ label: 'off', value: 'off', disabled: true }, ...TABS])
    await nextTick()
    expect(selected(wrapper)).toBe(1)
  })

  it('pairs each tab with its panel through derived ids', async () => {
    wrapper = mountTabs()
    await nextTick()

    const tab = tabs(wrapper)[0]
    const panel = wrapper.find('[role="tabpanel"]')
    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
  })

  it('keeps ids valid when the value is not', async () => {
    wrapper = mountTabs({}, [{ label: 'odd', value: 'ação preferida' }])
    await nextTick()

    const id = tabs(wrapper)[0].attributes('id')
    // Spaces and accents in an id break the aria-controls pairing.
    expect(id).toMatch(/^[a-zA-Z0-9_-]+$/)
  })

  it('shows only the selected panel', async () => {
    wrapper = mountTabs()
    await nextTick()

    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0].isVisible()).toBe(true)
    expect(panels[1].isVisible()).toBe(false)

    await tabs(wrapper)[1].trigger('click')
    await nextTick()
    expect(panels[0].isVisible()).toBe(false)
    expect(panels[1].isVisible()).toBe(true)
  })

  it('switches without v-model and reports the change', async () => {
    wrapper = mountTabs()
    await nextTick()

    await tabs(wrapper)[2].trigger('click')
    expect(selected(wrapper)).toBe(2)
    expect(wrapper.emitted('update:modelValue')).toEqual([['three']])
    expect(wrapper.emitted('change')).toEqual([['three']])
  })

  it('selects as the arrows move by default', async () => {
    wrapper = mountTabs()
    await nextTick()

    await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(selected(wrapper)).toBe(1)
  })

  it('waits for Enter when activation is manual', async () => {
    wrapper = mountTabs({ activation: 'manual' })
    await nextTick()

    const list = wrapper.find('[role="tablist"]')
    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(selected(wrapper)).toBe(0)
    expect(document.activeElement?.textContent).toBe('second')

    await list.trigger('keydown', { key: 'Enter' })
    expect(selected(wrapper)).toBe(1)
  })

  it('leaves one tab stop and moves it with the selection', async () => {
    wrapper = mountTabs()
    await nextTick()

    expect(tabs(wrapper).map((t) => t.attributes('tabindex'))).toEqual(['0', '-1', '-1'])

    await tabs(wrapper)[1].trigger('click')
    await nextTick()
    expect(tabs(wrapper).map((t) => t.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
  })

  it('renders the tab the consumer controls', async () => {
    wrapper = mountTabs({ modelValue: 'three' })
    await nextTick()
    expect(selected(wrapper)).toBe(2)

    await tabs(wrapper)[0].trigger('click')
    expect(selected(wrapper)).toBe(2)
    expect(wrapper.emitted('update:modelValue')).toEqual([['one']])
  })

  // The tab stop follows the selection from the first render onwards, and a
  // page carrying a tablist below the fold must still open at its own top.
  it('does not scroll the page just by rendering', async () => {
    const spy = vi.fn()
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    Element.prototype.scrollIntoView = spy

    try {
      wrapper = mountTabs({ modelValue: 'three' })
      await nextTick()
      await nextTick()

      expect(selected(wrapper)).toBe(2)
      expect(spy).not.toHaveBeenCalled()
    } finally {
      if (original) Object.defineProperty(Element.prototype, 'scrollIntoView', original)
      else delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
  })
})
