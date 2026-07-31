import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useControllable } from '../composables/useControllable'

/** What the harness exposes, already unwrapped the way vm hands it over. */
interface Exposed<T> {
  value: T
  setValue: (next: T) => void
  controlled: boolean
}

/** A component that does nothing but hold one controllable value. */
function harness<T>(defaultValue: T | (() => T), initial?: T) {
  const Host = defineComponent({
    // Untyped on purpose: the point is one harness for booleans, strings and
    // arrays, and the cast below is where the type comes back.
    // Absent means uncontrolled, which is the state under test, so the default
    // has to stay undefined.
    props: { modelValue: { type: null, default: undefined } },
    emits: ['update:modelValue'],
    setup(props, { emit, expose }) {
      const controllable = useControllable<T>(
        () => props.modelValue as T | undefined,
        (value) => emit('update:modelValue', value),
        defaultValue,
      )
      expose(controllable)
      return () => h('div', String(controllable.value.value))
    },
  })

  const wrapper = mount(Host, { props: { modelValue: initial } })
  return { wrapper, vm: wrapper.vm as unknown as Exposed<T> }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useControllable', () => {
  it('keeps the value itself when the prop is absent', async () => {
    const { wrapper, vm } = harness(false)
    expect(vm.value).toBe(false)

    vm.setValue(true)
    await nextTick()

    expect(vm.value).toBe(true)
    expect(wrapper.text()).toBe('true')
    // Still reports the change, so v-model and a bare listener both work.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    wrapper.unmount()
  })

  it('renders what the consumer hands back rather than what it was told', async () => {
    const { wrapper, vm } = harness(false, false)

    vm.setValue(true)
    await nextTick()

    // The consumer has not answered yet, so nothing moved.
    expect(vm.value).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])

    await wrapper.setProps({ modelValue: true })
    expect(vm.value).toBe(true)
    wrapper.unmount()
  })

  it('reports the control mode', async () => {
    const { wrapper, vm } = harness(false)
    expect(vm.controlled).toBe(false)

    await wrapper.setProps({ modelValue: true })
    expect(vm.controlled).toBe(true)
    wrapper.unmount()
  })

  it('says nothing when the value did not change', () => {
    const { wrapper, vm } = harness('md')
    vm.setValue('md')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('tracks a default that derives from props until the first change', async () => {
    const fallback = ref('first')
    const { wrapper, vm } = harness<string>(() => fallback.value)

    expect(vm.value).toBe('first')
    fallback.value = 'second'
    await nextTick()
    expect(vm.value).toBe('second')

    // Once the user picks something the default stops mattering.
    vm.setValue('chosen')
    fallback.value = 'third'
    await nextTick()
    expect(vm.value).toBe('chosen')
    wrapper.unmount()
  })

  it('replaces an array rather than mutating it', async () => {
    const { wrapper, vm } = harness<string[]>([])
    const before = vm.value

    vm.setValue(['a'])
    await nextTick()

    expect(before).toEqual([])
    expect(vm.value).toEqual(['a'])
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']]])
    wrapper.unmount()
  })
})
