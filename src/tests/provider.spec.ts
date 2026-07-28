import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { GlassProvider, useGlassLight } from '../index'

describe('GlassProvider', () => {
  it('renders the slot and injects the SVG filter definition', () => {
    const wrapper = mount(GlassProvider, {
      slots: { default: () => h('p', { id: 'content' }, 'hello') },
    })
    expect(wrapper.find('#content').exists()).toBe(true)
    expect(wrapper.find('filter#gt-refraction').exists()).toBe(true)
    wrapper.unmount()
  })

  it('clears custom properties and attributes from the root element on unmount', () => {
    const wrapper = mount(GlassProvider)
    wrapper.unmount()
    const html = document.documentElement
    expect(html.style.getPropertyValue('--gt-light-x')).toBe('')
    expect(html.hasAttribute('data-gt-refract')).toBe(false)
    expect(html.hasAttribute('data-gt-sheen')).toBe(false)
  })

  it('provides the light source to descendants', () => {
    const Probe = defineComponent({
      setup() {
        const light = useGlassLight()
        return () => h('span', { 'data-mode': light.mode.value })
      },
    })
    const wrapper = mount(GlassProvider, { slots: { default: () => h(Probe) } })
    const mode = wrapper.find('span').attributes('data-mode')
    expect(['pointer', 'drift', 'static']).toContain(mode)
    wrapper.unmount()
  })
})
