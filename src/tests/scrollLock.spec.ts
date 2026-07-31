import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { lockScroll, resetScrollLock, scrollLockCount } from '../internal/scrollLock'

const root = () => document.documentElement

beforeEach(() => {
  root().style.overflow = ''
  root().style.paddingRight = ''
})

afterEach(() => {
  resetScrollLock()
  root().style.overflow = ''
  root().style.paddingRight = ''
})

describe('scrollLock', () => {
  it('holds the page and hands it back', () => {
    const release = lockScroll()
    expect(root().style.overflow).toBe('hidden')

    release()
    expect(root().style.overflow).toBe('')
    expect(scrollLockCount()).toBe(0)
  })

  it('restores what was there rather than assuming it was empty', () => {
    root().style.overflow = 'scroll'

    const release = lockScroll()
    expect(root().style.overflow).toBe('hidden')

    release()
    expect(root().style.overflow).toBe('scroll')
  })

  it('keeps the page locked until the last layer lets go', () => {
    const releaseModal = lockScroll()
    const releaseDrawer = lockScroll()
    expect(scrollLockCount()).toBe(2)

    // The drawer closing must not hand the page back under the modal.
    releaseDrawer()
    expect(root().style.overflow).toBe('hidden')

    releaseModal()
    expect(root().style.overflow).toBe('')
  })

  it('does not read the locked state as the state to restore', () => {
    const releaseModal = lockScroll()
    const releaseDrawer = lockScroll()

    releaseModal()
    releaseDrawer()

    // A second lock that recorded overflow while it was already hidden would
    // leave the page stuck here forever.
    expect(root().style.overflow).toBe('')
  })

  it('ignores a release that already ran', () => {
    const release = lockScroll()
    lockScroll()

    release()
    release()

    expect(scrollLockCount()).toBe(1)
    expect(root().style.overflow).toBe('hidden')
  })

  it('reserves the width the scrollbar was taking', () => {
    const width = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    Object.defineProperty(window, 'innerWidth', { value: root().clientWidth + 15, writable: true })

    const release = lockScroll()
    expect(root().style.paddingRight).toBe('15px')

    release()
    expect(root().style.paddingRight).toBe('')
    if (width) Object.defineProperty(window, 'innerWidth', width)
  })
})
