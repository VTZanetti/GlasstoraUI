import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { GlassInput } from '../index'

describe('GlassInput', () => {
  it('round trips the model value', async () => {
    const wrapper = mount(GlassInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('glasstora')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['glasstora'])
  })

  it('renders the prompt prefix when enabled', () => {
    const wrapper = mount(GlassInput, { props: { prompt: true } })
    expect(wrapper.find('.gt-input__prompt').text()).toBe('>')
  })

  it('marks the field as invalid for assistive technology', () => {
    const wrapper = mount(GlassInput, { props: { invalid: true } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })
})
