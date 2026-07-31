/* eslint-disable vue/one-component-per-file -- probes are throwaway fixtures */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import {
  GlassAlert,
  GlassAvatar,
  GlassCheckbox,
  GlassField,
  GlassInput,
  GlassProgress,
  GlassSkeleton,
  GlassSpinner,
  GlassSurface,
  GlassSwitch,
  GlassTerminal,
  GlassTextarea,
} from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import { resetFrames, resetMediaQueries, setMediaQuery } from './doubles'

beforeEach(() => {
  resetFrames()
  resetMediaQueries()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  resetLightRegistry()
})

describe('GlassSurface', () => {
  it('maps its props onto the shared surface classes', () => {
    const wrapper = mount(GlassSurface, { props: { elevation: 3, radius: 'full' } })
    const classes = wrapper.element.className.split(/\s+/)
    expect(classes).toEqual(
      expect.arrayContaining(['gt-surface', 'gt-glass', 'gt-elev-3', 'gt-r-full']),
    )
    wrapper.unmount()
  })

  it('renders the element named by the as prop', () => {
    const wrapper = mount(GlassSurface, { props: { as: 'section' } })
    expect(wrapper.element.tagName).toBe('SECTION')
    wrapper.unmount()
  })
})

describe('GlassSwitch', () => {
  it('toggles through v-model and reports its state', async () => {
    const wrapper = mount(GlassSwitch, { props: { modelValue: false } })
    expect(wrapper.attributes('aria-checked')).toBe('false')
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    wrapper.unmount()
  })

  it('stays put while disabled', async () => {
    const wrapper = mount(GlassSwitch, { props: { modelValue: false, disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GlassProgress', () => {
  it('clamps the reported ratio into range', () => {
    const wrapper = mount(GlassProgress, { props: { value: 300, max: 100, showValue: true } })
    expect(wrapper.text()).toContain('100%')
    wrapper.unmount()
  })

  it('treats a non positive max as empty rather than dividing by it', () => {
    const wrapper = mount(GlassProgress, { props: { value: 5, max: 0, showValue: true } })
    expect(wrapper.text()).toContain('0%')
    wrapper.unmount()
  })

  it('drops aria-valuenow and the percentage while indeterminate', () => {
    const wrapper = mount(GlassProgress, {
      props: { indeterminate: true, value: 40, showValue: true },
    })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.text()).not.toContain('%')
    wrapper.unmount()
  })

  it('draws one cell per column in the blocks and dots modes', () => {
    for (const mode of ['blocks', 'dots'] as const) {
      const wrapper = mount(GlassProgress, { props: { mode, cols: 10, value: 50 } })
      expect(wrapper.findAll('.gt-progress__cell'), mode).toHaveLength(10)
      // Half the value fills half the cells, at the brightest level.
      expect(wrapper.findAll('.gt-progress__cell--3'), mode).toHaveLength(5)
      wrapper.unmount()
    }
  })

  it('sweeps a band across the cells while indeterminate', async () => {
    const wrapper = mount(GlassProgress, {
      props: { mode: 'blocks', cols: 20, indeterminate: true },
    })
    const lit = () => wrapper.findAll('.gt-progress__cell--3').map((c) => c.attributes('class'))
    const first = wrapper.html()

    vi.advanceTimersByTime(400)
    await nextTick()

    expect(lit().length).toBeGreaterThan(0)
    expect(wrapper.html()).not.toBe(first)
    wrapper.unmount()
  })

  it('sweeps a graded band across the ascii track while indeterminate', async () => {
    const wrapper = mount(GlassProgress, {
      props: { mode: 'ascii', indeterminate: true, cols: 20 },
    })
    const bar = () => wrapper.find('.gt-progress__ascii').text()

    // Two characters would only let a cell blink. The partial shades are what
    // make the band read as travelling.
    expect(new Set(bar())).toContain('▓')

    const frames: string[] = []
    for (let i = 0; i < 12; i++) {
      frames.push(bar())
      vi.advanceTimersByTime(120)
      await nextTick()
    }

    expect(new Set(frames).size).toBeGreaterThan(6)
    expect(frames.every((f) => f.length === 20)).toBe(true)
    // The band wraps rather than sliding off, so the track is never blank. An
    // empty frame is the stall that made the old bar read as on and off.
    expect(frames.some((f) => !f.includes('█'))).toBe(false)
    wrapper.unmount()
  })

  it('parks the ascii band mid track under prefers reduced motion', async () => {
    setMediaQuery('(prefers-reduced-motion: reduce)', true)
    const wrapper = mount(GlassProgress, {
      props: { mode: 'ascii', indeterminate: true, cols: 20 },
    })
    const first = wrapper.find('.gt-progress__ascii').text()
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(wrapper.find('.gt-progress__ascii').text()).toBe(first)
    // Parked in the middle rather than frozen at step zero, where the band sits
    // off the track and the bar would read as empty.
    expect(first).toContain('█')
    wrapper.unmount()
  })

  it('keeps the determinate ascii bar on the two original characters', () => {
    const wrapper = mount(GlassProgress, { props: { mode: 'ascii', value: 50, cols: 10 } })
    expect(wrapper.find('.gt-progress__ascii').text()).toBe('█████░░░░░')
    wrapper.unmount()
  })
})

describe('GlassSpinner', () => {
  it('cycles its frames at the requested rate', async () => {
    // Twenty frames a second is one every fifty milliseconds.
    const wrapper = mount(GlassSpinner, { props: { speed: 20 } })
    const first = wrapper.text()
    vi.advanceTimersByTime(50)
    await nextTick()
    expect(wrapper.text()).not.toBe(first)
    wrapper.unmount()
  })

  it('spins faster the higher the speed, not slower', async () => {
    const slow = mount(GlassSpinner, { props: { speed: 4 } })
    const slowFirst = slow.text()

    vi.advanceTimersByTime(50)
    await nextTick()
    // Four frames a second has not reached its second frame yet.
    expect(slow.text()).toBe(slowFirst)

    vi.advanceTimersByTime(250)
    await nextTick()
    expect(slow.text()).not.toBe(slowFirst)
    slow.unmount()
  })

  it('holds still under prefers reduced motion', async () => {
    setMediaQuery('(prefers-reduced-motion: reduce)', true)
    const wrapper = mount(GlassSpinner, { props: { speed: 20 } })
    const first = wrapper.text()
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(wrapper.text()).toBe(first)
    wrapper.unmount()
  })
})

describe('GlassTerminal', () => {
  it('replays when the lines prop changes', async () => {
    const wrapper = mount(GlassTerminal, {
      props: { lines: ['first'], typewriter: true, speed: 1 },
    })
    vi.advanceTimersByTime(50)
    await nextTick()
    expect(wrapper.text()).toContain('first')

    await wrapper.setProps({ lines: ['second'] })
    vi.advanceTimersByTime(50)
    await nextTick()
    expect(wrapper.text()).toContain('second')
    wrapper.unmount()
  })

  it('shows everything at once under prefers reduced motion', async () => {
    setMediaQuery('(prefers-reduced-motion: reduce)', true)
    const wrapper = mount(GlassTerminal, {
      props: { lines: ['alpha', 'beta'], typewriter: true },
    })
    await nextTick()
    expect(wrapper.text()).toContain('beta')
    expect(wrapper.emitted('done')).toBeTruthy()
    wrapper.unmount()
  })
})

describe('GlassInput', () => {
  it('exposes the inner input for imperative focus', () => {
    // Attached, because jsdom will not focus an element outside the document.
    const wrapper = mount(GlassInput, { attachTo: document.body })
    const exposed = wrapper.vm as unknown as { input: HTMLInputElement; focus: () => void }
    expect(exposed.input).toBeInstanceOf(HTMLInputElement)
    exposed.focus()
    expect(document.activeElement).toBe(exposed.input)
    wrapper.unmount()
  })

  it('forwards the form attributes to the inner input', () => {
    const wrapper = mount(GlassInput, {
      props: { id: 'email', name: 'email', autocomplete: 'email', readonly: true },
    })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('email')
    expect(input.attributes('name')).toBe('email')
    expect(input.attributes('autocomplete')).toBe('email')
    expect(input.attributes('readonly')).toBeDefined()
    wrapper.unmount()
  })
})

describe('GlassField', () => {
  it('labels and describes the control inside it', () => {
    const Host = defineComponent({
      components: { GlassField, GlassInput },
      template: `
        <GlassField label="E-mail" description="usamos so para login" error="obrigatorio">
          <GlassInput />
        </GlassField>
      `,
    })
    const wrapper = mount(Host)
    const input = wrapper.find('input')
    const id = input.attributes('id')

    expect(wrapper.find('label').attributes('for')).toBe(id)
    expect(input.attributes('aria-describedby')).toBe(`${id}-description ${id}-error`)
    expect(input.attributes('aria-invalid')).toBe('true')
    wrapper.unmount()
  })

  it('lets the control keep an id it was given', () => {
    const Host = defineComponent({
      components: { GlassField, GlassInput },
      template: `<GlassField label="x"><GlassInput id="mine" /></GlassField>`,
    })
    const wrapper = mount(Host)
    expect(wrapper.find('input').attributes('id')).toBe('mine')
    wrapper.unmount()
  })
})

describe('GlassTextarea', () => {
  it('emits through v-model', async () => {
    const wrapper = mount(GlassTextarea)
    const area = wrapper.find('textarea')
    await area.setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
    wrapper.unmount()
  })
})

describe('GlassCheckbox', () => {
  it('reports the mixed state when indeterminate', () => {
    const wrapper = mount(GlassCheckbox, { props: { indeterminate: true } })
    expect(wrapper.attributes('aria-checked')).toBe('mixed')
    wrapper.unmount()
  })

  it('toggles on click', async () => {
    const wrapper = mount(GlassCheckbox, { props: { modelValue: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    wrapper.unmount()
  })
})

describe('GlassAlert', () => {
  it('announces an error assertively and anything else politely', () => {
    const error = mount(GlassAlert, { props: { variant: 'error' } })
    expect(error.attributes('role')).toBe('alert')
    error.unmount()

    const info = mount(GlassAlert)
    expect(info.attributes('role')).toBe('status')
    info.unmount()
  })

  it('emits close from the dismiss button', async () => {
    const wrapper = mount(GlassAlert, { props: { closable: true } })
    await wrapper.find('.gt-alert__close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })
})

describe('GlassAvatar', () => {
  it('derives initials from the name when there is no image', () => {
    const wrapper = mount(GlassAvatar, { props: { name: 'vitor zanetti' } })
    expect(wrapper.text()).toBe('VZ')
    expect(wrapper.attributes('role')).toBe('img')
    wrapper.unmount()
  })

  it('falls back to the initials when the image fails to load', async () => {
    const wrapper = mount(GlassAvatar, { props: { src: '/missing.png', name: 'ada lovelace' } })
    expect(wrapper.find('img').exists()).toBe(true)
    await wrapper.find('img').trigger('error')
    expect(wrapper.text()).toBe('AL')
    wrapper.unmount()
  })
})

describe('GlassSkeleton', () => {
  it('renders one bar per line and shortens the last one', () => {
    const wrapper = mount(GlassSkeleton, { props: { lines: 3 } })
    const bars = wrapper.findAll('.gt-skeleton__bar')
    expect(bars).toHaveLength(3)
    expect(bars[2].attributes('style')).toContain('62%')
    wrapper.unmount()
  })

  it('is hidden from assistive technology', () => {
    const wrapper = mount(GlassSkeleton)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})

describe('probe', () => {
  it('mounts every surface component without a provider above it', () => {
    // The registry has to tolerate a page with no GlassProvider at all: the
    // components still render, they just never receive a light.
    const wrapper = mount(defineComponent({ render: () => h(GlassSurface, null, () => 'x') }))
    expect(wrapper.text()).toBe('x')
    wrapper.unmount()
  })
})
