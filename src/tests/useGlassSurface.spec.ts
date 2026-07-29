import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useGlassSurface } from '../composables/useGlassSurface'
import { resetLightRegistry, setLightSource, surfaceCount } from '../internal/lightRegistry'
import { flushFrames, resetFrames, resetMediaQueries, stubRect } from './doubles'

function host(options: Parameters<typeof useGlassSurface>[0] = {}) {
  return defineComponent({
    setup() {
      const { surfaceAttrs, measure } = useGlassSurface(options)
      return { surfaceAttrs, measure }
    },
    render() {
      return h('div', { ...this.surfaceAttrs })
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

describe('useGlassSurface', () => {
  it('applies the glass classes to the bound element', () => {
    const wrapper = mount(host({ interactive: true, elevation: 2, radius: 'lg' }))
    const classes = wrapper.element.className.split(/\s+/)
    expect(classes).toContain('gt-glass')
    expect(classes).toContain('gt-glass--interactive')
    expect(classes).toContain('gt-elev-2')
    expect(classes).toContain('gt-r-lg')
    wrapper.unmount()
  })

  it('leaves elevation and radius to the component when they are not given', () => {
    const wrapper = mount(host())
    expect(wrapper.element.className).toBe('gt-glass')
    wrapper.unmount()
  })

  it('registers on mount and releases on unmount', () => {
    const wrapper = mount(host())
    expect(surfaceCount()).toBe(1)
    wrapper.unmount()
    expect(surfaceCount()).toBe(0)
  })

  it('keeps the element unregistered when the light option is false', () => {
    const wrapper = mount(host({ light: false }))
    expect(surfaceCount()).toBe(0)
    expect(wrapper.element.hasAttribute('data-gt-lit')).toBe(false)
    wrapper.unmount()
  })

  it('registers and releases as the light option is toggled', async () => {
    const light = ref(false)
    const wrapper = mount(host({ light }))
    expect(surfaceCount()).toBe(0)

    light.value = true
    await wrapper.vm.$nextTick()
    expect(surfaceCount()).toBe(1)

    light.value = false
    await wrapper.vm.$nextTick()
    expect(surfaceCount()).toBe(0)
    wrapper.unmount()
  })

  it('reports the resolved light through the onLight hook', () => {
    const seen: number[] = []
    const wrapper = mount(host({ onLight: (value) => seen.push(value.u) }))
    stubRect(wrapper.element, { left: 0, top: 0, width: 200, height: 100 })

    // The rect only exists from now on, so the surface has to be told to look
    // again. Nothing else can observe a jsdom element gaining a size.
    wrapper.vm.measure()
    setLightSource(150, 50)
    flushFrames()

    expect(seen.at(-1)).toBeCloseTo(75)
    wrapper.unmount()
  })
})
