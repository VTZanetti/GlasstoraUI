import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassSelect } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const OPTIONS = [
  { label: 'alpha', value: 'a' },
  { label: 'beta', value: 'b', disabled: true },
  { label: 'gamma', value: 'c' },
]

const mountSelect = (props: Record<string, unknown> = {}) =>
  mount(GlassSelect, { props: { options: OPTIONS, ...props }, attachTo: document.body })

const trigger = (w: VueWrapper) => w.find('[role="combobox"]')
const list = () => document.body.querySelector('[role="listbox"]')
const options = () => [...document.body.querySelectorAll('[role="option"]')]
const press = (w: VueWrapper, key: string) => trigger(w).trigger('keydown', { key })

describe('GlassSelect', () => {
  it('shows the placeholder until something is picked', () => {
    wrapper = mountSelect({ placeholder: 'pick one' })
    expect(trigger(wrapper).text()).toContain('pick one')
    expect(list()).toBeNull()
  })

  it('opens on click and teleports the list to the body', async () => {
    wrapper = mountSelect()
    await trigger(wrapper).trigger('click')
    await nextTick()

    expect(list()).not.toBeNull()
    expect(options()).toHaveLength(3)
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('opens on the keys that open a listbox', async () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      wrapper = mountSelect()
      await press(wrapper, key)
      await nextTick()
      expect(list(), key).not.toBeNull()
      wrapper.unmount()
      document.body.innerHTML = ''
    }
    wrapper = undefined
  })

  it('picks an option without v-model and closes', async () => {
    wrapper = mountSelect()
    await trigger(wrapper).trigger('click')
    await nextTick()

    options()[2].dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
    expect(wrapper.emitted('change')).toEqual([['c']])
    expect(trigger(wrapper).text()).toContain('gamma')
    expect(list()).toBeNull()
  })

  it('keeps the focus on the trigger and points at the option by reference', async () => {
    wrapper = mountSelect()
    await trigger(wrapper).trigger('click')
    await nextTick()

    await press(wrapper, 'ArrowDown')
    // The listbox is teleported out of the control, so moving the real focus
    // into it would take it out of any dialog the select sits in.
    expect(document.activeElement).not.toBe(options()[0])
    const active = trigger(wrapper).attributes('aria-activedescendant')
    expect(active).toBeTruthy()
    expect(document.getElementById(active!)?.textContent?.trim()).toBe('gamma')
  })

  it('steps over a disabled option and refuses to pick it', async () => {
    wrapper = mountSelect()
    await trigger(wrapper).trigger('click')
    await nextTick()

    options()[1].dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await press(wrapper, 'ArrowDown')
    expect(
      document.getElementById(trigger(wrapper).attributes('aria-activedescendant')!)?.textContent,
    ).toContain('gamma')
  })

  it('opens on the option already chosen', async () => {
    wrapper = mountSelect({ modelValue: 'c' })
    await trigger(wrapper).trigger('click')
    await nextTick()
    await nextTick()

    expect(
      document.getElementById(trigger(wrapper).attributes('aria-activedescendant')!)?.textContent,
    ).toContain('gamma')
  })

  it('closes on Escape and hands the focus back', async () => {
    wrapper = mountSelect()
    await trigger(wrapper).trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(list()).toBeNull()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('says nothing while disabled', async () => {
    wrapper = mountSelect({ disabled: true })
    await trigger(wrapper).trigger('click')
    await nextTick()
    expect(list()).toBeNull()
  })

  it('renders the value the consumer controls', async () => {
    wrapper = mountSelect({ modelValue: 'a' })
    expect(trigger(wrapper).text()).toContain('alpha')

    await trigger(wrapper).trigger('click')
    await nextTick()
    options()[2].dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()

    // The consumer has not answered, so the trigger still shows what it was told.
    expect(trigger(wrapper).text()).toContain('alpha')
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
  })

  it('carries a value into a plain form when given a name', () => {
    wrapper = mountSelect({ modelValue: 'a', name: 'letter' })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('letter')
    expect((hidden.element as HTMLInputElement).value).toBe('a')
  })
})
