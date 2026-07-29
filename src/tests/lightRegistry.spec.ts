import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  configureLight,
  registerSurface,
  resetLightRegistry,
  setLightSource,
  surfaceCount,
} from '../internal/lightRegistry'
import {
  flushFrames,
  pendingFrames,
  resetFrames,
  resetMediaQueries,
  setMediaQuery,
  stubRect,
  triggerIntersection,
  triggerResize,
} from './doubles'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function makeSurface(rect: Partial<DOMRect> = { left: 0, top: 0, width: 100, height: 100 }) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  stubRect(el, rect)
  return el
}

beforeEach(() => {
  resetFrames()
  resetMediaQueries()
})

afterEach(() => {
  resetLightRegistry()
  document.body.innerHTML = ''
})

describe('lightRegistry', () => {
  it('writes the five custom properties on a registered surface', () => {
    const el = makeSurface()
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    expect(el.style.getPropertyValue('--gt-light-u')).toBe('50.0%')
    expect(el.style.getPropertyValue('--gt-light-v')).toBe('50.0%')
    expect(el.style.getPropertyValue('--gt-light-angle')).toBe('0.0deg')
    expect(el.style.getPropertyValue('--gt-light-energy')).toBe('1.000')
    expect(el.style.getPropertyValue('--gt-light-incidence')).toBe('1.000')
  })

  it('marks the element so the stylesheet switches to the element recipe', () => {
    const el = makeSurface()
    const handle = registerSurface(el)
    expect(el.hasAttribute('data-gt-lit')).toBe(true)
    handle.release()
    expect(el.hasAttribute('data-gt-lit')).toBe(false)
  })

  it('stops writing after a surface is released', () => {
    const el = makeSurface()
    const handle = registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    handle.release()
    expect(surfaceCount()).toBe(0)
    expect(el.style.getPropertyValue('--gt-light-u')).toBe('')

    const spy = vi.spyOn(el.style, 'setProperty')
    setLightSource(400, 400)
    flushFrames()
    expect(spy).not.toHaveBeenCalled()
  })

  it('skips surfaces the viewport observer reported as offscreen', () => {
    const el = makeSurface()
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    triggerIntersection(el, false)
    const spy = vi.spyOn(el.style, 'setProperty')
    setLightSource(60, 60)
    flushFrames()
    expect(spy).not.toHaveBeenCalled()

    triggerIntersection(el, true)
    setLightSource(70, 70)
    flushFrames()
    expect(spy).toHaveBeenCalled()
  })

  it('writes only the energy property once a surface falls out of range', () => {
    const el = makeSurface()
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    const spy = vi.spyOn(el.style, 'setProperty')
    setLightSource(20000, 20000)
    flushFrames()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('--gt-light-energy', '0.000')
  })

  it('parks the animation loop when neither the light nor the geometry changed', () => {
    const el = makeSurface()
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()
    expect(pendingFrames()).toBe(0)
  })

  it('resumes the loop when a new surface registers', () => {
    registerSurface(makeSurface())
    flushFrames()
    expect(pendingFrames()).toBe(0)

    registerSurface(makeSurface())
    expect(pendingFrames()).toBe(1)
  })

  it('resumes the loop when a resize invalidates a rect', () => {
    const el = makeSurface()
    registerSurface(el)
    flushFrames()
    expect(pendingFrames()).toBe(0)

    triggerResize(el)
    expect(pendingFrames()).toBe(1)
  })

  it('never keeps the loop running while prefers reduced motion is set', () => {
    setMediaQuery(REDUCED_MOTION, true)
    const el = makeSurface()
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    // One pass still happens, so the surface gets a highlight that matches
    // where it sits. What it does not get is a loop.
    expect(el.style.getPropertyValue('--gt-light-energy')).toBe('1.000')
    expect(pendingFrames()).toBe(0)
  })

  it('batches every rect read before the first style write', () => {
    const order: string[] = []
    const surfaces = [makeSurface(), makeSurface({ left: 200, top: 0, width: 100, height: 100 })]

    for (const el of surfaces) {
      const measure = el.getBoundingClientRect.bind(el)
      el.getBoundingClientRect = () => {
        order.push('read')
        return measure()
      }
      const write = el.style.setProperty.bind(el.style)
      vi.spyOn(el.style, 'setProperty').mockImplementation((...args) => {
        order.push('write')
        return write(...args)
      })
      registerSurface(el)
    }

    setLightSource(50, 50)
    flushFrames()

    expect(order).toContain('read')
    expect(order).toContain('write')
    // Interleaving the two is what forces a synchronous layout per surface.
    expect(order.lastIndexOf('read')).toBeLessThan(order.indexOf('write'))
  })

  it('re-measures a volatile surface every frame', () => {
    // What the modal panel needs: it animates in on a transform, so its rect is
    // different on every frame of the transition and nothing observes that.
    const el = makeSurface({ left: 0, top: 0, width: 100, height: 100 })
    registerSurface(el, { volatile: true })
    setLightSource(50, 50)
    flushFrames()

    stubRect(el, { left: 200, top: 0, width: 100, height: 100 })
    flushFrames()
    expect(el.style.getPropertyValue('--gt-light-u')).toBe('-150.0%')
  })

  it('leaves a still surface on its cached rect', () => {
    const el = makeSurface({ left: 0, top: 0, width: 100, height: 100 })
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    // Moved behind the registry's back, with nothing volatile and no observer
    // firing. The cached rect is what it keeps using, which is the whole point
    // of not calling getBoundingClientRect sixty times a second per surface.
    stubRect(el, { left: 200, top: 0, width: 100, height: 100 })
    setLightSource(51, 50)
    flushFrames()
    expect(el.style.getPropertyValue('--gt-light-u')).toBe('51.0%')
  })

  it('re-measures for a few frames after a transform transition ends', () => {
    const el = makeSurface({ left: 0, top: 0, width: 100, height: 100 })
    registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    el.dispatchEvent(new Event('transitionrun'))
    stubRect(el, { left: 40, top: 0, width: 100, height: 100 })
    flushFrames()
    expect(el.style.getPropertyValue('--gt-light-u')).toBe('10.0%')
  })

  it('applies a per surface gain on top of the shared tuning', () => {
    const near = makeSurface({ left: 0, top: 0, width: 100, height: 100 })
    const dim = makeSurface({ left: 0, top: 0, width: 100, height: 100 })
    registerSurface(near, { gain: 1 })
    registerSurface(dim, { gain: 0.25 })

    // Far enough out that the falloff has taken hold, so the gains diverge.
    setLightSource(700, 50)
    flushFrames()

    const nearEnergy = Number(near.style.getPropertyValue('--gt-light-energy'))
    const dimEnergy = Number(dim.style.getPropertyValue('--gt-light-energy'))
    expect(nearEnergy).toBeGreaterThan(0)
    expect(dimEnergy).toBeCloseTo(nearEnergy * 0.25, 2)
  })

  it('re-measures every surface when the tuning changes', () => {
    const el = makeSurface()
    registerSurface(el)
    setLightSource(600, 50)
    flushFrames()
    const before = el.style.getPropertyValue('--gt-light-energy')

    configureLight({ falloff: 3000 })
    flushFrames()

    expect(el.style.getPropertyValue('--gt-light-energy')).not.toBe(before)
  })

  it('suspends a surface without releasing it', () => {
    const el = makeSurface()
    const handle = registerSurface(el)
    setLightSource(50, 50)
    flushFrames()

    handle.update({ enabled: false })
    const spy = vi.spyOn(el.style, 'setProperty')
    setLightSource(80, 80)
    flushFrames()
    expect(spy).not.toHaveBeenCalled()
    expect(surfaceCount()).toBe(1)
  })
})
