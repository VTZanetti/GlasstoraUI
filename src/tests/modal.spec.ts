import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { GlassModal } from '../index'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function mountModal(props: Record<string, unknown> = {}) {
  return mount(GlassModal, {
    props: { modelValue: true, title: 'dialog', ...props },
    slots: { default: 'modal content' },
    attachTo: document.body,
  })
}

describe('GlassModal', () => {
  it('labels the close button in English by default and accepts an override', async () => {
    wrapper = mountModal()
    await nextTick()
    expect(document.body.querySelector('.gt-modal__close')?.getAttribute('aria-label')).toBe(
      'Close',
    )

    wrapper.unmount()
    wrapper = mountModal({ closeLabel: 'Fechar' })
    await nextTick()
    expect(document.body.querySelector('.gt-modal__close')?.getAttribute('aria-label')).toBe(
      'Fechar',
    )
  })

  it('teleports the panel to the body when open', async () => {
    wrapper = mountModal()
    await nextTick()
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('modal content')
  })

  it('closes on Escape', async () => {
    wrapper = mountModal()
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('ignores Escape when closeOnEsc is false', async () => {
    wrapper = mountModal({ closeOnEsc: false })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes on overlay click and honours closeOnOverlay', async () => {
    wrapper = mountModal()
    await nextTick()
    ;(document.body.querySelector('.gt-modal__overlay') as HTMLElement).click()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])

    wrapper.unmount()
    wrapper = mountModal({ closeOnOverlay: false })
    await nextTick()
    ;(document.body.querySelector('.gt-modal__overlay') as HTMLElement).click()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('restores the document overflow and scrollbar padding after closing', async () => {
    wrapper = mountModal()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
    await wrapper.setProps({ modelValue: false })
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.documentElement.style.paddingRight).toBe('')
  })
})
