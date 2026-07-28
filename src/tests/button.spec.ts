import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { GlassButton } from '../index'

describe('GlassButton', () => {
  it('renders the slot and emits click', async () => {
    const wrapper = mount(GlassButton, { slots: { default: 'run' } })
    expect(wrapper.text()).toContain('run')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click while disabled', async () => {
    const wrapper = mount(GlassButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('shows the spinner, sets aria-busy and suppresses click while loading', async () => {
    const wrapper = mount(GlassButton, { props: { loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.gt-button__spinner').exists()).toBe(true)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    wrapper.unmount()
  })
})
