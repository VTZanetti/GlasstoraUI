import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassMenu } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import type { GlassMenuEntry } from '../types'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const ITEMS: GlassMenuEntry[] = [
  { label: 'copy', value: 'copy' },
  { label: 'paste', value: 'paste', disabled: true },
  { separator: true },
  { label: 'delete', value: 'delete', danger: true },
]

interface TriggerSlot {
  open: boolean
  toggle: () => void
  attrs: Record<string, unknown>
}

const mountMenu = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
  mount(GlassMenu, {
    props: { items: ITEMS, ...props },
    slots: { label: 'actions', ...slots },
    attachTo: document.body,
  })

const trigger = (w: VueWrapper) => w.find('.gt-menu__trigger')
const menu = () => document.body.querySelector('[role="menu"]')
const items = () => [...document.body.querySelectorAll('[role="menuitem"]')]

/** The panel is teleported, so its keys are dispatched where they land. */
const pressInMenu = async (key: string) => {
  menu()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  await nextTick()
}

const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('GlassMenu', () => {
  it('opens from the trigger and teleports the menu to the body', async () => {
    wrapper = mountMenu()
    expect(menu()).toBeNull()

    await trigger(wrapper).trigger('click')
    await settle()

    expect(menu()).not.toBeNull()
    expect(items()).toHaveLength(3)
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    expect(trigger(wrapper).attributes('aria-controls')).toBe(menu()?.id)
    expect(wrapper.emitted('open')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('opens on ArrowDown and moves the focus onto the first item', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await settle()

    expect(menu()).not.toBeNull()
    expect(document.activeElement).toBe(items()[0])
  })

  it('steps over a disabled item with the arrows', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()

    await pressInMenu('ArrowDown')

    // paste is disabled, so the focus lands on delete.
    expect(document.activeElement?.textContent?.trim()).toBe('delete')
  })

  it('refuses to fire a disabled item', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()

    const disabled = document.body.querySelectorAll('.gt-menu__item')[1]
    disabled.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(menu()).not.toBeNull()
  })

  it('renders a separator entry as a separator', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()

    expect(document.body.querySelectorAll('[role="separator"]')).toHaveLength(1)
  })

  it('marks a destructive item so it reads differently', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()

    expect(items()[2].classList.contains('gt-menu__item--danger')).toBe(true)
    expect(items()[0].classList.contains('gt-menu__item--danger')).toBe(false)
  })

  it('reports the item it selected, closes and hands the focus back', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()

    items()[0].dispatchEvent(new Event('click', { bubbles: true }))
    await settle()

    expect(wrapper.emitted('select')?.[0]).toEqual([{ label: 'copy', value: 'copy' }])
    expect(menu()).toBeNull()
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(document.activeElement).toBe(trigger(wrapper).element)
  })

  it('closes on Escape and hands the focus back to the trigger', async () => {
    wrapper = mountMenu()
    await trigger(wrapper).trigger('click')
    await settle()
    expect(document.activeElement).toBe(items()[0])

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()

    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper).element)
  })

  it('hands the trigger slot everything it needs to describe itself', async () => {
    wrapper = mountMenu(
      {},
      {
        trigger: (params: TriggerSlot) =>
          h(
            'button',
            { class: 'own', ...params.attrs, onClick: params.toggle },
            params.open ? 'open' : 'shut',
          ),
      },
    )

    const own = wrapper.find('.own')
    expect(own.attributes('aria-haspopup')).toBe('menu')
    expect(own.attributes('aria-expanded')).toBe('false')
    expect(own.text()).toBe('shut')

    await own.trigger('click')
    await settle()

    expect(menu()).not.toBeNull()
    expect(own.attributes('aria-controls')).toBe(menu()?.id)
    expect(own.text()).toBe('open')
  })

  it('stays shut while disabled', async () => {
    wrapper = mountMenu({ disabled: true })
    await trigger(wrapper).trigger('click')
    await trigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await settle()

    expect(menu()).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('renders the state the consumer controls', async () => {
    wrapper = mountMenu({ modelValue: true })
    await settle()
    expect(menu()).not.toBeNull()

    items()[0].dispatchEvent(new Event('click', { bubbles: true }))
    await settle()

    // The consumer has not answered, so the menu is still up.
    expect(menu()).not.toBeNull()
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
