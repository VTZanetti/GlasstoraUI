import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassRadio, GlassRadioGroup } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

function mountGroup(props: Record<string, unknown> = {}, values = ['one', 'two', 'three']) {
  return mount(GlassRadioGroup, {
    props,
    slots: {
      default: () => values.map((value) => h(GlassRadio, { value, key: value }, () => value)),
    },
    attachTo: document.body,
  })
}

const radios = (w: VueWrapper) => w.findAll('[role="radio"]')
const checked = (w: VueWrapper) =>
  radios(w).findIndex((radio) => radio.attributes('aria-checked') === 'true')

describe('GlassRadioGroup', () => {
  it('is a radiogroup holding radios', async () => {
    wrapper = mountGroup()
    await nextTick()

    expect(wrapper.attributes('role')).toBe('radiogroup')
    expect(radios(wrapper)).toHaveLength(3)
    expect(checked(wrapper)).toBe(-1)
  })

  it('picks a value without v-model', async () => {
    wrapper = mountGroup()
    await nextTick()

    await radios(wrapper)[1].trigger('click')
    expect(checked(wrapper)).toBe(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
    expect(wrapper.emitted('change')).toEqual([['two']])
  })

  it('renders the value the consumer controls', async () => {
    wrapper = mountGroup({ modelValue: 'three' })
    await nextTick()
    expect(checked(wrapper)).toBe(2)

    await radios(wrapper)[0].trigger('click')
    // The consumer has not answered, so the selection stays where it was told.
    expect(checked(wrapper)).toBe(2)
    expect(wrapper.emitted('update:modelValue')).toEqual([['one']])
  })

  it('hands one tab stop to the group and moves it with the selection', async () => {
    wrapper = mountGroup()
    await nextTick()

    expect(radios(wrapper).map((r) => r.attributes('tabindex'))).toEqual(['0', '-1', '-1'])

    await radios(wrapper)[2].trigger('click')
    await nextTick()
    expect(radios(wrapper).map((r) => r.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
  })

  it('selects as the arrows move, which is what a radio group does', async () => {
    wrapper = mountGroup()
    await nextTick()

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(checked(wrapper)).toBe(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
  })

  it('follows the axis it was given', async () => {
    wrapper = mountGroup({ orientation: 'horizontal' })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
  })

  it('gets numbers back rather than the strings the DOM stores', async () => {
    wrapper = mount(GlassRadioGroup, {
      props: { modelValue: 1 },
      slots: { default: () => [1, 2].map((value) => h(GlassRadio, { value, key: value })) },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
  })

  it('takes the whole group out when disabled', async () => {
    wrapper = mountGroup({ disabled: true })
    await nextTick()

    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(radios(wrapper)[0].attributes('disabled')).toBeDefined()

    await radios(wrapper)[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('shares its name with every radio inside', async () => {
    wrapper = mountGroup({ name: 'plan' })
    await nextTick()
    expect(radios(wrapper).map((r) => r.attributes('name'))).toEqual(['plan', 'plan', 'plan'])
  })

  // The group moves its tab stop onto the checked radio as it renders. Doing
  // that through a scroll would send a page holding one of these far below the
  // fold to the group instead of to its own top.
  it('does not scroll the page just by rendering', async () => {
    const spy = vi.fn()
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    Element.prototype.scrollIntoView = spy

    try {
      wrapper = mountGroup({ modelValue: 'three' })
      await nextTick()
      await nextTick()

      expect(checked(wrapper)).toBe(2)
      expect(spy).not.toHaveBeenCalled()
    } finally {
      if (original) Object.defineProperty(Element.prototype, 'scrollIntoView', original)
      else delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
  })
})
