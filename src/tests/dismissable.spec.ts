/* eslint-disable vue/one-component-per-file */
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref, type PropType } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { dismissableDepth, useDismissable } from '../composables/useDismissable'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

/** A layer that reports its own dismissals, shaped like the real ones. */
const Layer = defineComponent({
  props: {
    open: { type: Boolean, default: true },
    name: { type: String, required: true },
    report: { type: Function as PropType<(name: string) => void>, required: true },
  },
  setup(props) {
    const panel = ref<HTMLElement | null>(null)
    useDismissable({
      open: () => props.open,
      inside: [panel],
      onDismiss: () => props.report(props.name),
    })
    return () => h('div', { ref: panel, class: `layer-${props.name}` }, `panel ${props.name}`)
  },
})

/** Two layers side by side in the body, the shape a Teleport produces. */
function stack(report: (name: string) => void, innerOpen = ref(true)) {
  return defineComponent({
    setup() {
      return () => [
        h(Layer, { name: 'modal', report }),
        h(Layer, { name: 'menu', report, open: innerOpen.value }),
      ]
    },
  })
}

const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

function pointerDownOn(target: Element) {
  target.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

describe('useDismissable', () => {
  it('closes on Escape and on a pointer outside', async () => {
    const dismissed: string[] = []
    wrapper = mount(Layer, {
      props: { name: 'only', report: (name: string) => dismissed.push(name) },
      attachTo: document.body,
    })
    await nextTick()

    escape()
    expect(dismissed).toEqual(['only'])

    pointerDownOn(document.body)
    expect(dismissed).toEqual(['only', 'only'])
  })

  it('leaves the pointer alone inside the panel', async () => {
    const dismissed: string[] = []
    wrapper = mount(Layer, {
      props: { name: 'only', report: (name: string) => dismissed.push(name) },
      attachTo: document.body,
    })
    await nextTick()

    pointerDownOn(document.querySelector('.layer-only')!)
    expect(dismissed).toEqual([])
  })

  it('gives Escape to the topmost layer alone', async () => {
    const dismissed: string[] = []
    wrapper = mount(
      stack((name) => dismissed.push(name)),
      { attachTo: document.body },
    )
    await nextTick()

    expect(dismissableDepth()).toBe(2)

    // Without a stack both layers answer at once and the modal closes under
    // the menu that was meant to take the key.
    escape()
    expect(dismissed).toEqual(['menu'])
  })

  it('does not read a pointer on the inner panel as outside the outer one', async () => {
    const dismissed: string[] = []
    wrapper = mount(
      stack((name) => dismissed.push(name)),
      { attachTo: document.body },
    )
    await nextTick()

    // The menu panel is a sibling of the modal panel rather than a descendant,
    // so the modal alone would have called this outside itself.
    pointerDownOn(document.querySelector('.layer-menu')!)
    expect(dismissed).toEqual([])
  })

  it('hands the top back when the inner layer closes', async () => {
    const dismissed: string[] = []
    const innerOpen = ref(true)
    wrapper = mount(
      stack((name) => dismissed.push(name), innerOpen),
      { attachTo: document.body },
    )
    await nextTick()

    innerOpen.value = false
    await nextTick()

    expect(dismissableDepth()).toBe(1)
    escape()
    expect(dismissed).toEqual(['modal'])
  })

  it('leaves nothing on the stack once unmounted', async () => {
    const local = mount(Layer, {
      props: { name: 'only', report: () => {} },
      attachTo: document.body,
    })
    await nextTick()
    expect(dismissableDepth()).toBe(1)

    local.unmount()
    expect(dismissableDepth()).toBe(0)
  })
})
