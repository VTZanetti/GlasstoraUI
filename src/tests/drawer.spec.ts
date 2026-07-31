import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { GlassDrawer, GlassModal } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import { resetScrollLock, scrollLockCount } from '../internal/scrollLock'

let wrapper: VueWrapper | undefined
let modal: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  modal?.unmount()
  modal = undefined
  resetLightRegistry()
  resetScrollLock()
  document.body.innerHTML = ''
})

function mountDrawer(props: Record<string, unknown> = {}) {
  return mount(GlassDrawer, {
    props: { modelValue: true, title: 'panel', ...props },
    slots: { default: 'drawer content' },
    attachTo: document.body,
  })
}

const press = (el: Element) =>
  el.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }))

describe('GlassDrawer', () => {
  it('teleports the panel to the body and marks it as a modal dialog', async () => {
    wrapper = mountDrawer()
    await nextTick()
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.textContent).toContain('drawer content')
  })

  it('labels the close button in English by default and accepts an override', async () => {
    wrapper = mountDrawer()
    await nextTick()
    expect(document.body.querySelector('.gt-drawer__close')?.getAttribute('aria-label')).toBe(
      'Close',
    )

    wrapper.unmount()
    wrapper = mountDrawer({ closeLabel: 'Fechar' })
    await nextTick()
    expect(document.body.querySelector('.gt-drawer__close')?.getAttribute('aria-label')).toBe(
      'Fechar',
    )
  })

  it('closes on Escape and ignores it when closeOnEsc is false', async () => {
    wrapper = mountDrawer()
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
    wrapper = mountDrawer({ closeOnEsc: false })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes on an overlay press and honours closeOnOverlay', async () => {
    // Pointerdown rather than click: a press that starts inside the panel and
    // ends past its edge must not dismiss.
    wrapper = mountDrawer()
    await nextTick()
    press(document.body.querySelector('.gt-drawer__overlay') as HTMLElement)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])

    wrapper.unmount()
    wrapper = mountDrawer({ closeOnOverlay: false })
    await nextTick()
    press(document.body.querySelector('.gt-drawer__overlay') as HTMLElement)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps a press inside the panel from dismissing', async () => {
    wrapper = mountDrawer()
    await nextTick()
    press(document.body.querySelector('[role="dialog"]') as HTMLElement)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('attaches to the right by default and follows the side prop', async () => {
    wrapper = mountDrawer()
    await nextTick()
    expect(document.body.querySelector('.gt-drawer--right')).not.toBeNull()

    await wrapper.setProps({ side: 'left' })
    expect(document.body.querySelector('.gt-drawer--right')).toBeNull()
    expect(document.body.querySelector('.gt-drawer--left')).not.toBeNull()
  })

  it('carries the size as a custom property on the root, not on the panel', async () => {
    wrapper = mountDrawer({ size: '30rem' })
    await nextTick()
    const root = document.body.querySelector('.gt-drawer') as HTMLElement
    const panel = document.body.querySelector('.gt-drawer__panel') as HTMLElement
    expect(root.style.getPropertyValue('--gt-drawer-size')).toBe('30rem')
    expect(panel.style.getPropertyValue('--gt-drawer-size')).toBe('')
  })

  it('locks the page while it is open and hands it back on close', async () => {
    wrapper = mountDrawer()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')

    await wrapper.setProps({ modelValue: false })
    expect(document.documentElement.style.overflow).toBe('')
    expect(scrollLockCount()).toBe(0)
  })

  it('leaves the page locked when it closes over an open modal', async () => {
    modal = mount(GlassModal, {
      props: { modelValue: true, title: 'dialog' },
      attachTo: document.body,
    })
    wrapper = mountDrawer()
    await nextTick()
    expect(scrollLockCount()).toBe(2)

    await wrapper.setProps({ modelValue: false })

    // The drawer closing must not hand the page back under the modal.
    expect(scrollLockCount()).toBe(1)
    expect(document.documentElement.style.overflow).toBe('hidden')

    await modal.setProps({ modelValue: false })
    expect(document.documentElement.style.overflow).toBe('')
  })
})
