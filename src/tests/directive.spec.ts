import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref, withDirectives } from 'vue'
import { mount } from '@vue/test-utils'
import { vGlass } from '../directives/glass'
import { resetLightRegistry, surfaceCount } from '../internal/lightRegistry'
import { resetFrames, resetMediaQueries } from './doubles'

function host(value: unknown, modifiers: Record<string, boolean> = {}) {
  return defineComponent({
    setup: () => ({ value: ref(value) }),
    render() {
      return withDirectives(h('div'), [[vGlass, this.value, '', modifiers]])
    },
  })
}

beforeEach(() => {
  resetFrames()
  resetMediaQueries()
})

afterEach(() => {
  resetLightRegistry()
})

describe('v-glass', () => {
  it('adds the glass class to the host element', () => {
    const wrapper = mount(host(undefined))
    expect(wrapper.element.classList.contains('gt-glass')).toBe(true)
    expect(surfaceCount()).toBe(1)
    wrapper.unmount()
  })

  it('maps modifiers to surface options', () => {
    const wrapper = mount(host(undefined, { interactive: true, flat: true }))
    const classes = wrapper.element.className.split(/\s+/)
    expect(classes).toContain('gt-glass--interactive')
    expect(classes).toContain('gt-elev-0')
    wrapper.unmount()
  })

  it('lets the value override a modifier', () => {
    const wrapper = mount(host({ elevation: 3 }, { flat: true }))
    expect(wrapper.element.className.split(/\s+/)).toContain('gt-elev-3')
    wrapper.unmount()
  })

  it('leaves the element on the viewport recipe with the no-light modifier', () => {
    const wrapper = mount(host(undefined, { 'no-light': true }))
    expect(wrapper.element.classList.contains('gt-glass')).toBe(true)
    expect(wrapper.element.hasAttribute('data-gt-lit')).toBe(false)
    expect(surfaceCount()).toBe(0)
    wrapper.unmount()
  })

  it('releases the surface and drops its classes on unmount', () => {
    const wrapper = mount(host(undefined))
    const el = wrapper.element
    wrapper.unmount()
    expect(surfaceCount()).toBe(0)
    expect(el.classList.contains('gt-glass')).toBe(false)
  })

  it('swaps classes when the binding changes instead of stacking them', async () => {
    const wrapper = mount(host({ radius: 'sm' }))
    expect(wrapper.element.className.split(/\s+/)).toContain('gt-r-sm')

    wrapper.vm.value = { radius: 'lg' }
    await wrapper.vm.$nextTick()

    const classes = wrapper.element.className.split(/\s+/)
    expect(classes).toContain('gt-r-lg')
    expect(classes).not.toContain('gt-r-sm')
    wrapper.unmount()
  })

  it('emits the same classes from getSSRProps that the client applies', () => {
    const binding = {
      value: { elevation: 2 },
      modifiers: { interactive: true },
    } as never

    expect(vGlass.getSSRProps?.(binding, null as never)).toEqual({
      class: 'gt-glass gt-glass--interactive gt-elev-2',
    })
  })
})
