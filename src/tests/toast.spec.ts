import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { GlassToast } from '../index'
import { resetToasts, useToast } from '../composables/useToast'
import { resetLightRegistry, surfaceCount } from '../internal/lightRegistry'

const { show, dismiss, clear, toasts } = useToast()

let wrapper: VueWrapper | undefined

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  resetLightRegistry()
  resetToasts()
  document.body.innerHTML = ''
})

/** The outlet registers itself on mount, so it renders from the next tick. */
async function mountOutlet(props: Record<string, unknown> = {}) {
  const outlet = mount(GlassToast, { props, attachTo: document.body })
  await nextTick()
  return outlet
}

const items = () => document.body.querySelectorAll('.gt-toast__item')
const region = () => document.body.querySelector('.gt-toast') as HTMLElement

describe('useToast', () => {
  it('queues a toast and hands back its id', () => {
    const { toasts } = useToast()
    const id = show({ message: 'saved' })

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].id).toBe(id)
    expect(toasts.value[0].message).toBe('saved')
  })

  it('empties the queue on clear', () => {
    const { toasts } = useToast()
    show({ message: 'one' })
    show({ message: 'two' })

    clear()

    expect(toasts.value).toHaveLength(0)
  })
})

describe('GlassToast', () => {
  it('renders the queue inside a live region teleported to the body', async () => {
    wrapper = await mountOutlet()
    show({ title: 'Done', message: 'saved' })
    await nextTick()

    expect(region().getAttribute('role')).toBe('region')
    expect(region().getAttribute('aria-live')).toBe('polite')
    expect(region().getAttribute('aria-label')).toBe('Notifications')
    expect(items()).toHaveLength(1)
    expect(region().textContent).toContain('saved')
  })

  it('lets a consumer rename the region', async () => {
    wrapper = mount(GlassToast, {
      attrs: { 'aria-label': 'Notificações' },
      attachTo: document.body,
    })
    await nextTick()

    expect(region().getAttribute('aria-label')).toBe('Notificações')
  })

  it('drops a toast on dismiss', async () => {
    wrapper = await mountOutlet()
    const id = show({ message: 'saved' })
    show({ message: 'kept' })
    await nextTick()
    expect(items()).toHaveLength(2)

    dismiss(id)
    await nextTick()

    expect(items()).toHaveLength(1)
    expect(region().textContent).toContain('kept')
  })

  it('closes from its own button', async () => {
    wrapper = await mountOutlet()
    show({ message: 'saved' })
    await nextTick()

    const close = document.body.querySelector('.gt-toast__close') as HTMLButtonElement
    expect(close.getAttribute('aria-label')).toBe('Dismiss')
    close.click()
    await nextTick()

    expect(items()).toHaveLength(0)
  })

  it('keeps a toast that asked for no close button', async () => {
    wrapper = await mountOutlet()
    show({ message: 'saved', closable: false })
    await nextTick()

    expect(document.body.querySelector('.gt-toast__close')).toBeNull()
  })

  it('takes itself down when the duration runs out', async () => {
    wrapper = await mountOutlet()
    show({ message: 'saved', duration: 1000 })
    await nextTick()

    vi.advanceTimersByTime(999)
    await nextTick()
    expect(items()).toHaveLength(1)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('stays for as long as it takes when the duration is zero', async () => {
    wrapper = await mountOutlet()
    show({ message: 'saved', duration: 0 })
    await nextTick()

    vi.advanceTimersByTime(60_000)
    await nextTick()

    expect(items()).toHaveLength(1)
  })

  it('reads an error out as an alert and everything else as a status', async () => {
    wrapper = await mountOutlet()
    show({ message: 'broken', variant: 'error' })
    show({ message: 'fine', variant: 'success' })
    await nextTick()

    const roles = [...items()].map((item) => item.getAttribute('role'))
    expect(roles).toEqual(['alert', 'status'])
  })

  it('shows only the newest toasts past max', async () => {
    wrapper = await mountOutlet({ max: 2 })
    show({ message: 'first' })
    show({ message: 'second' })
    show({ message: 'third' })
    await nextTick()

    const messages = [...items()].map(
      (item) => item.querySelector('.gt-toast__message')?.textContent,
    )
    expect(messages).toEqual(['second', 'third'])
  })

  it('takes the toasts past max down rather than hiding them', async () => {
    wrapper = await mountOutlet({ max: 2 })
    for (let i = 0; i < 8; i++) show({ message: `toast ${i}`, duration: 0 })
    await nextTick()
    await nextTick()

    // Left in the queue behind the cap, their countdowns keep running and they
    // surface again as the visible ones expire, long after the burst.
    expect(toasts.value).toHaveLength(2)
    expect(toasts.value.map((toast) => toast.message)).toEqual(['toast 6', 'toast 7'])
  })

  it('keeps one light registration per visible toast through a burst', async () => {
    wrapper = await mountOutlet()
    for (let i = 0; i < 6; i++) show({ message: `toast ${i}`, duration: 0 })
    await nextTick()
    await nextTick()

    // A ref that changes identity on every render releases and re-registers
    // every surface each time the list is patched.
    expect(surfaceCount()).toBe(6)

    show({ message: 'one more', duration: 0 })
    await nextTick()
    await nextTick()
    expect(surfaceCount()).toBe(7)
  })

  it('lights every item and lets the registry go with it', async () => {
    wrapper = await mountOutlet()
    show({ message: 'first', duration: 0 })
    show({ message: 'second', duration: 0 })
    await nextTick()

    const item = document.body.querySelector('.gt-toast__item') as HTMLElement
    expect(item.classList.contains('gt-glass')).toBe(true)
    expect(surfaceCount()).toBe(2)

    clear()
    await nextTick()
    expect(surfaceCount()).toBe(0)
  })

  it('holds the countdown while the pointer is on the stack and gives back what was left', async () => {
    wrapper = await mountOutlet()
    show({ message: 'saved', duration: 1000 })
    await nextTick()

    vi.advanceTimersByTime(600)
    region().dispatchEvent(new MouseEvent('mouseenter'))

    vi.advanceTimersByTime(10_000)
    await nextTick()
    expect(items()).toHaveLength(1)

    region().dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(399)
    await nextTick()
    // 400ms were left when the pointer arrived, so one more millisecond ends it.
    expect(items()).toHaveLength(1)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('lets the newest outlet render the queue on its own', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    wrapper = await mountOutlet()
    const second = await mountOutlet()
    show({ message: 'saved' })
    await nextTick()

    expect(warn).toHaveBeenCalledOnce()
    expect(items()).toHaveLength(1)

    second.unmount()
    await nextTick()

    // The first outlet takes the queue back rather than leaving it unrendered.
    expect(items()).toHaveLength(1)
    warn.mockRestore()
  })
})
