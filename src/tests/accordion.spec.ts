import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { GlassAccordion } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import type { GlassAccordionItem } from '../types'

const items: GlassAccordionItem[] = [
  { value: 'one', title: 'first' },
  { value: 'two', title: 'second' },
  { value: 'three', title: 'third', disabled: true },
]

afterEach(() => {
  resetLightRegistry()
})

describe('GlassAccordion', () => {
  it('opens a section on its own, with no v-model above it', async () => {
    const wrapper = mount(GlassAccordion, { props: { items } })
    const triggers = wrapper.findAll('.gt-accordion__trigger')
    expect(triggers[0].attributes('aria-expanded')).toBe('false')

    await triggers[0].trigger('click')

    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['one'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['one'])
    wrapper.unmount()
  })

  it('closes the open section when another one opens in single mode', async () => {
    const wrapper = mount(GlassAccordion, { props: { items } })
    const triggers = wrapper.findAll('.gt-accordion__trigger')

    await triggers[0].trigger('click')
    await triggers[1].trigger('click')

    expect(triggers[0].attributes('aria-expanded')).toBe('false')
    expect(triggers[1].attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['two'])
    wrapper.unmount()
  })

  it('closes a section by clicking it again', async () => {
    const wrapper = mount(GlassAccordion, { props: { items } })
    const trigger = wrapper.findAll('.gt-accordion__trigger')[0]

    await trigger.trigger('click')
    await trigger.trigger('click')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([''])
    wrapper.unmount()
  })

  it('keeps several sections open in multiple mode', async () => {
    const wrapper = mount(GlassAccordion, { props: { items, multiple: true } })
    const triggers = wrapper.findAll('.gt-accordion__trigger')

    await triggers[0].trigger('click')
    await triggers[1].trigger('click')

    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[1].attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['one', 'two']])
    wrapper.unmount()
  })

  it('replaces the open list rather than mutating the one it was given', async () => {
    const open = ['one']
    const wrapper = mount(GlassAccordion, {
      props: { items, multiple: true, modelValue: open },
    })

    await wrapper.findAll('.gt-accordion__trigger')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['one', 'two']])
    expect(open).toEqual(['one'])
    wrapper.unmount()
  })

  it('drops a value from the list when its section closes', async () => {
    const wrapper = mount(GlassAccordion, {
      props: { items, multiple: true, modelValue: ['one', 'two'] },
    })

    await wrapper.findAll('.gt-accordion__trigger')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['two']])
    wrapper.unmount()
  })

  it('points every trigger at the region it controls', () => {
    const wrapper = mount(GlassAccordion, { props: { items } })
    const trigger = wrapper.findAll('.gt-accordion__trigger')[1]
    const region = wrapper.findAll('.gt-accordion__region')[1]

    expect(trigger.attributes('aria-controls')).toBe(region.attributes('id'))
    expect(region.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
    expect(region.attributes('role')).toBe('region')
    wrapper.unmount()
  })

  it('leaves a disabled section shut', async () => {
    const wrapper = mount(GlassAccordion, { props: { items } })
    const trigger = wrapper.findAll('.gt-accordion__trigger')[2]
    expect(trigger.attributes('disabled')).toBeDefined()

    await trigger.trigger('click')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('prefers the slot named after the item and falls back to the content slot', () => {
    const wrapper = mount(GlassAccordion, {
      props: { items, modelValue: 'one' },
      slots: {
        one: '<p class="named">by name</p>',
        content: '<p class="shared">shared</p>',
        title: ({ item }: { item: GlassAccordionItem }) =>
          h('span', { class: 'custom' }, item.value),
      },
    })
    const panels = wrapper.findAll('.gt-accordion__content')

    expect(panels[0].find('.named').exists()).toBe(true)
    expect(panels[1].find('.shared').exists()).toBe(true)
    expect(wrapper.findAll('.custom')[0].text()).toBe('one')
    wrapper.unmount()
  })
})
