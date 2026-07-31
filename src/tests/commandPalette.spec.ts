import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassCommandPalette } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import type { GlassCommand } from '../types'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const COMMANDS: GlassCommand[] = [
  { id: 'new', label: 'New file', group: 'File', shortcut: 'ctrl n', keywords: ['create'] },
  { id: 'open', label: 'Open file', group: 'File' },
  { id: 'theme', label: 'Toggle theme', group: 'View' },
  { id: 'quit', label: 'Quit' },
]

// 'mod' resolves to Control off Apple hardware, and jsdom never claims to be a
// Mac. The tests name the modifier outright so nothing depends on that.
const mountPalette = (props: Record<string, unknown> = {}) =>
  mount(GlassCommandPalette, {
    props: { commands: COMMANDS, hotkey: 'ctrl+k', ...props },
    attachTo: document.body,
  })

const dialog = () => document.body.querySelector('[role="dialog"]')
const search = () => document.body.querySelector('[role="combobox"]') as HTMLInputElement | null
const options = () => [...document.body.querySelectorAll('[role="option"]')]
const groups = () => [...document.body.querySelectorAll('[role="group"]')]
const labels = () =>
  options().map((option) => option.querySelector('.gt-palette__label')?.textContent?.trim())

const settle = async () => {
  await nextTick()
  await nextTick()
  await nextTick()
}

const type = async (value: string) => {
  const input = search()!
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle()
}

const press = async (key: string) => {
  search()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  await settle()
}

describe('GlassCommandPalette', () => {
  it('opens on its hotkey and closes on the next press', async () => {
    wrapper = mountPalette()
    expect(dialog()).toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    await settle()

    expect(dialog()).not.toBeNull()
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    await settle()

    expect(dialog()).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('ignores the key on its own and an empty hotkey', async () => {
    wrapper = mountPalette({ hotkey: '' })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    await settle()
    expect(dialog()).toBeNull()

    wrapper.unmount()
    wrapper = mountPalette()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    await settle()
    expect(dialog()).toBeNull()
  })

  it('names itself and takes the focus into the search box', async () => {
    wrapper = mountPalette({ modelValue: true, label: 'commands' })
    await settle()

    expect(dialog()?.getAttribute('aria-label')).toBe('commands')
    expect(document.body.querySelector('.gt-modal__close')).toBeNull()
    expect(document.activeElement).toBe(search())
  })

  it('gathers the commands under their group and leaves the rest unlabelled', async () => {
    wrapper = mountPalette({ modelValue: true })
    await settle()

    expect(groups()).toHaveLength(3)
    expect(groups()[0].getAttribute('aria-label')).toBe('File')
    expect(groups()[1].getAttribute('aria-label')).toBe('View')
    expect(groups()[2].hasAttribute('aria-label')).toBe(false)
    expect(labels()).toHaveLength(4)
  })

  it('searches the label and the keywords', async () => {
    wrapper = mountPalette({ modelValue: true })
    await settle()

    await type('file')
    expect(labels()).toEqual(['New file', 'Open file'])

    await type('create')
    expect(labels()).toEqual(['New file'])
  })

  it('shows the no results label when the search matches nothing', async () => {
    wrapper = mountPalette({ modelValue: true, noResultsLabel: 'nothing here' })
    await settle()

    await type('zzz')

    expect(options()).toHaveLength(0)
    expect(dialog()?.textContent).toContain('nothing here')
  })

  it('renders the shortcut of a command in a key cap', async () => {
    wrapper = mountPalette({ modelValue: true })
    await settle()

    expect(options()[0].querySelector('.gt-kbd')?.textContent?.trim()).toBe('ctrl n')
    expect(options()[1].querySelector('.gt-kbd')).toBeNull()
  })

  it('walks the results with the arrows and points at them by reference', async () => {
    wrapper = mountPalette({ modelValue: true })
    await settle()

    expect(search()?.getAttribute('aria-activedescendant')).toBe(options()[0].id)

    await press('ArrowDown')

    expect(search()?.getAttribute('aria-activedescendant')).toBe(options()[1].id)
    // The focus never leaves the search box, so the typing keeps working.
    expect(document.activeElement).toBe(search())
  })

  it('runs the active command on Enter, then closes and clears the search', async () => {
    wrapper = mountPalette({ modelValue: true })
    await settle()

    await type('theme')
    await press('Enter')

    expect(wrapper.emitted('select')?.[0]).toEqual([COMMANDS[2]])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(search()?.value).toBe('')
  })

  it('runs a command by click and refuses a disabled one', async () => {
    wrapper = mountPalette({
      modelValue: true,
      commands: [{ id: 'off', label: 'Unavailable', group: 'File', disabled: true }, ...COMMANDS],
    })
    await settle()

    options()[0].dispatchEvent(new Event('click', { bubbles: true }))
    await settle()
    expect(wrapper.emitted('select')).toBeUndefined()

    options()[1].dispatchEvent(new Event('click', { bubbles: true }))
    await settle()
    expect(wrapper.emitted('select')?.[0]).toEqual([COMMANDS[0]])
  })
})
