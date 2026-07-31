import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassCombobox } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import type { GlassSelectOption } from '../types'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const OPTIONS: GlassSelectOption[] = [
  { label: 'alpha', value: 'a' },
  { label: 'beta', value: 'b', disabled: true },
  { label: 'gamma', value: 'c' },
]

const mountCombobox = (props: Record<string, unknown> = {}) =>
  mount(GlassCombobox, { props: { options: OPTIONS, ...props }, attachTo: document.body })

const box = (w: VueWrapper) => w.find('[role="combobox"]')
const text = (w: VueWrapper) => (box(w).element as HTMLInputElement).value
const list = () => document.body.querySelector('[role="listbox"]')
const options = () => [...document.body.querySelectorAll('[role="option"]')]
const activeText = (w: VueWrapper) => {
  const id = box(w).attributes('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent?.trim() : undefined
}

const type = async (w: VueWrapper, value: string) => {
  await box(w).setValue(value)
  await nextTick()
  await nextTick()
}

describe('GlassCombobox', () => {
  it('opens on focus and teleports the list to the body', async () => {
    wrapper = mountCombobox()
    expect(list()).toBeNull()

    await box(wrapper).trigger('focus')
    await nextTick()

    expect(list()).not.toBeNull()
    expect(options()).toHaveLength(3)
    expect(box(wrapper).attributes('aria-expanded')).toBe('true')
    expect(box(wrapper).attributes('aria-controls')).toBe(list()?.id)
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('narrows the list to what the text matches', async () => {
    wrapper = mountCombobox()
    await type(wrapper, 'gam')

    expect(options()).toHaveLength(1)
    expect(options()[0].textContent?.trim()).toBe('gamma')
  })

  it('puts the active option back on the first result whenever the filter changes', async () => {
    wrapper = mountCombobox()
    await box(wrapper).trigger('focus')
    await nextTick()

    await box(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(activeText(wrapper)).toBe('gamma')

    await type(wrapper, 'alp')

    // The option that was active has left the DOM, so the reference has to move
    // with the list rather than point at a node that is gone.
    const id = box(wrapper).attributes('aria-activedescendant')
    expect(document.getElementById(id!)).not.toBeNull()
    expect(activeText(wrapper)).toBe('alpha')
  })

  it('takes the query from the filter prop when there is one', async () => {
    const filter = (query: string, option: GlassSelectOption) => option.label.startsWith(query)
    wrapper = mountCombobox({ filter })
    await type(wrapper, 'a')

    // A substring match would have kept beta and gamma as well.
    expect(options().map((option) => option.textContent?.trim())).toEqual(['alpha'])
  })

  it('picks the active option with Enter and shows its label', async () => {
    wrapper = mountCombobox()
    await type(wrapper, 'gam')
    await box(wrapper).trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
    expect(wrapper.emitted('change')).toEqual([['c']])
    expect(text(wrapper)).toBe('gamma')
    expect(list()).toBeNull()
  })

  it('picks an option by click and refuses the disabled one', async () => {
    wrapper = mountCombobox()
    await box(wrapper).trigger('focus')
    await nextTick()

    options()[1].dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    options()[0].dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
    expect(text(wrapper)).toBe('alpha')
  })

  it('shows the no results label when the text matches nothing', async () => {
    wrapper = mountCombobox({ noResultsLabel: 'nothing here' })
    await type(wrapper, 'zzz')

    expect(options()).toHaveLength(0)
    expect(list()?.textContent).toContain('nothing here')
  })

  it('keeps the typed text as the value when custom values are allowed', async () => {
    wrapper = mountCombobox({ allowCustomValue: true })
    await type(wrapper, 'delta')
    await box(wrapper).trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['delta']])
    expect(text(wrapper)).toBe('delta')
  })

  it('settles the typed text on blur as well', async () => {
    wrapper = mountCombobox({ allowCustomValue: true })
    await type(wrapper, 'delta')
    await box(wrapper).trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toEqual([['delta']])
    expect(list()).toBeNull()
  })

  it('drops the typed text when it names no option and none is allowed', async () => {
    wrapper = mountCombobox({ modelValue: 'a' })
    await type(wrapper, 'delta')
    await box(wrapper).trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(text(wrapper)).toBe('alpha')
  })

  it('closes on Escape and puts the text of the value back', async () => {
    wrapper = mountCombobox({ modelValue: 'a' })
    expect(text(wrapper)).toBe('alpha')

    await type(wrapper, 'zz')
    expect(text(wrapper)).toBe('zz')

    await box(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(text(wrapper)).toBe('alpha')
    expect(list()).toBeNull()
  })

  it('says nothing while disabled', async () => {
    wrapper = mountCombobox({ disabled: true })
    await box(wrapper).trigger('focus')
    await nextTick()

    expect(list()).toBeNull()
  })

  it('carries a value into a plain form when given a name', () => {
    wrapper = mountCombobox({ modelValue: 'c', name: 'letter' })
    const hidden = wrapper.find('input[type="hidden"]')

    expect(hidden.attributes('name')).toBe('letter')
    expect((hidden.element as HTMLInputElement).value).toBe('c')
  })
})
