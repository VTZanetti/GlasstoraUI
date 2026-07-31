import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassSlider } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

function mountSlider(props: Record<string, unknown> = {}) {
  return mount(GlassSlider, { props, attachTo: document.body })
}

const thumb = (w: VueWrapper) => w.find('[role="slider"]')
const now = (w: VueWrapper) => Number(thumb(w).attributes('aria-valuenow'))
const key = (w: VueWrapper, k: string) => thumb(w).trigger('keydown', { key: k })

describe('GlassSlider', () => {
  it('starts at the minimum and reports its bounds', async () => {
    wrapper = mountSlider({ min: 10, max: 50 })
    await nextTick()

    expect(thumb(wrapper).attributes('aria-valuemin')).toBe('10')
    expect(thumb(wrapper).attributes('aria-valuemax')).toBe('50')
    expect(now(wrapper)).toBe(10)
  })

  it('moves by one step on the arrows without v-model', async () => {
    wrapper = mountSlider({ step: 5 })
    await nextTick()

    await key(wrapper, 'ArrowRight')
    expect(now(wrapper)).toBe(5)
    expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
    expect(wrapper.emitted('change')).toEqual([[5]])

    await key(wrapper, 'ArrowLeft')
    expect(now(wrapper)).toBe(0)
  })

  it('moves by ten steps on Page keys and to the ends on Home and End', async () => {
    wrapper = mountSlider({ modelValue: 50, step: 2 })
    await nextTick()

    await key(wrapper, 'PageUp')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([70])

    await wrapper.setProps({ modelValue: 70 })
    await key(wrapper, 'PageDown')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([50])

    await wrapper.setProps({ modelValue: 50 })
    await key(wrapper, 'End')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([100])

    await wrapper.setProps({ modelValue: 100 })
    await key(wrapper, 'Home')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('stops at the ends rather than running past them', async () => {
    wrapper = mountSlider({ modelValue: 100 })
    await nextTick()

    await key(wrapper, 'ArrowRight')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps a fractional step printable', async () => {
    wrapper = mountSlider({ step: 0.1, max: 1 })
    await nextTick()

    for (let press = 0; press < 3; press++) await key(wrapper, 'ArrowRight')

    // Three additions of 0.1 land on 0.30000000000000004 without rounding.
    expect(now(wrapper)).toBe(0.3)
  })

  it('snaps a value off the step grid onto it', async () => {
    wrapper = mountSlider({ modelValue: 37, step: 25 })
    await nextTick()
    expect(now(wrapper)).toBe(25)
  })

  it('says nothing while disabled', async () => {
    wrapper = mountSlider({ disabled: true })
    await nextTick()

    expect(thumb(wrapper).attributes('tabindex')).toBe('-1')
    await key(wrapper, 'ArrowRight')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('reads the value out through formatValue when there is one', async () => {
    wrapper = mountSlider({ modelValue: 40, formatValue: (v: number) => `${v} per cent` })
    await nextTick()

    expect(thumb(wrapper).attributes('aria-valuetext')).toBe('40 per cent')
  })

  it('prints the value beside the track when asked', async () => {
    wrapper = mountSlider({ modelValue: 42, showValue: true })
    await nextTick()
    expect(wrapper.find('.gt-slider__value').text()).toBe('42')
  })

  it('takes a value from the track under the pointer', async () => {
    wrapper = mountSlider()
    await nextTick()

    const track = wrapper.find('.gt-slider__track').element as HTMLElement
    track.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 4 }) as DOMRect
    // jsdom implements neither half of the pointer capture pair.
    track.setPointerCapture = () => {}
    track.hasPointerCapture = () => true
    track.releasePointerCapture = () => {}

    // Built rather than triggered: clientX is a getter, so test-utils cannot
    // assign it after the fact.
    const pointer = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX })
      Object.defineProperty(event, 'pointerId', { value: 1 })
      track.dispatchEvent(event)
      return nextTick()
    }

    await pointer('pointerdown', 50)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([25])

    await pointer('pointermove', 150)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([75])

    await pointer('pointerup', 150)
    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
