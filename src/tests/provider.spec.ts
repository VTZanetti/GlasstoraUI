/* eslint-disable vue/one-component-per-file -- probes are throwaway fixtures */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { mount } from '@vue/test-utils'
import { GlassProvider, useGlassLight } from '../index'
import { configKey, type GlassConfig } from '../internal/keys'
import { resetLightRegistry } from '../internal/lightRegistry'
import { flushFrames, resetFrames, resetMediaQueries } from './doubles'

function movePointer(x: number, y: number) {
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }))
}

beforeEach(() => {
  resetFrames()
  resetMediaQueries()
})

afterEach(() => {
  resetLightRegistry()
  document.documentElement.removeAttribute('data-gt-theme')
})

describe('GlassProvider', () => {
  it('renders the slot', () => {
    const wrapper = mount(GlassProvider, {
      slots: { default: () => h('p', { id: 'content' }, 'hello') },
    })
    expect(wrapper.find('#content').exists()).toBe(true)
    wrapper.unmount()
  })

  it('mounts the refraction filter into the document', () => {
    const wrapper = mount(GlassProvider)
    expect(document.querySelector('filter#gt-refraction')).not.toBeNull()
    wrapper.unmount()
    expect(document.querySelector('filter#gt-refraction')).toBeNull()
  })

  it('keeps the refraction filter alive when the first provider unmounts', () => {
    // The 0.1.0 provider decided who owned the filter once, at setup. Unmounting
    // that one took the definition away from every provider still running, and
    // refraction silently stopped working.
    const first = mount(GlassProvider)
    const second = mount(GlassProvider)

    first.unmount()
    expect(document.querySelector('filter#gt-refraction')).not.toBeNull()

    second.unmount()
    expect(document.querySelector('filter#gt-refraction')).toBeNull()
  })

  it('updates the displacement scale when refractionStrength changes', async () => {
    const wrapper = mount(GlassProvider, { props: { refractionStrength: 18 } })
    const map = document.querySelector('#gt-refraction feDisplacementMap')
    expect(map?.getAttribute('scale')).toBe('18')

    await wrapper.setProps({ refractionStrength: 33 })
    expect(map?.getAttribute('scale')).toBe('33')
    wrapper.unmount()
  })

  it('publishes the viewport space light while the pointer moves', () => {
    const wrapper = mount(GlassProvider)
    movePointer(120, 260)
    flushFrames()

    const html = document.documentElement
    expect(html.style.getPropertyValue('--gt-light-x')).toBe('120px')
    expect(html.style.getPropertyValue('--gt-light-y')).toBe('260px')

    wrapper.unmount()
    expect(html.style.getPropertyValue('--gt-light-x')).toBe('')
  })

  it('clears the attributes it owns from the root element on unmount', () => {
    const wrapper = mount(GlassProvider)
    expect(document.documentElement.getAttribute('data-gt-theme')).toBe('dark')

    wrapper.unmount()
    const html = document.documentElement
    expect(html.hasAttribute('data-gt-refract')).toBe(false)
    expect(html.hasAttribute('data-gt-sheen')).toBe(false)
    expect(html.hasAttribute('data-gt-theme')).toBe(false)
  })

  it('writes the requested theme onto the root element', async () => {
    const wrapper = mount(GlassProvider, { props: { theme: 'light' } })
    expect(document.documentElement.getAttribute('data-gt-theme')).toBe('light')

    await wrapper.setProps({ theme: 'dark' })
    expect(document.documentElement.getAttribute('data-gt-theme')).toBe('dark')
    wrapper.unmount()
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

  it('provides a config that tracks its props', async () => {
    // The 0.1.0 provider handed out a plain snapshot taken at setup, so a
    // consumer that injected it never saw grain being switched off.
    const Probe = defineComponent({
      setup() {
        const config = inject(configKey) as GlassConfig
        return () => h('span', { 'data-grain': String(config.grain) })
      },
    })
    const wrapper = mount(GlassProvider, {
      props: { grain: true },
      slots: { default: () => h(Probe) },
    })
    expect(wrapper.find('span').attributes('data-grain')).toBe('true')

    await wrapper.setProps({ grain: false })
    expect(wrapper.find('span').attributes('data-grain')).toBe('false')
    wrapper.unmount()
  })
})
