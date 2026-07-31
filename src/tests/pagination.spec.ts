import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassPagination } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

afterEach(() => {
  resetLightRegistry()
})

/** The numbers on the page buttons, in the order they were rendered. */
function numbers(wrapper: VueWrapper) {
  return wrapper.findAll('.gt-pagination__page').map((button) => button.text())
}

describe('GlassPagination', () => {
  it('keeps the page itself when nothing is controlling it', async () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 4 } })
    expect(wrapper.find('[aria-current="page"]').text()).toBe('1')

    await wrapper.findAll('.gt-pagination__page')[2].trigger('click')

    expect(wrapper.find('[aria-current="page"]').text()).toBe('3')
    expect(wrapper.emitted('change')).toEqual([[3]])
    wrapper.unmount()
  })

  it('emits update:modelValue and change for the page that was picked', async () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 10, modelValue: 2 } })

    await wrapper.findAll('.gt-pagination__page')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    expect(wrapper.emitted('change')).toEqual([[1]])
    // Controlled, so the strip renders what the consumer still says it is.
    expect(wrapper.find('[aria-current="page"]').text()).toBe('2')
    wrapper.unmount()
  })

  it('marks only the current page with aria-current', () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 5, modelValue: 4 } })
    const marked = wrapper.findAll('[aria-current="page"]')
    expect(marked).toHaveLength(1)
    expect(marked[0].text()).toBe('4')
    wrapper.unmount()
  })

  it('disables previous on the first page and next on the last', async () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 3, modelValue: 1 } })
    const previous = () => wrapper.find('.gt-pagination__nav--previous')
    const next = () => wrapper.find('.gt-pagination__nav--next')

    expect(previous().attributes('disabled')).toBeDefined()
    expect(next().attributes('disabled')).toBeUndefined()

    await wrapper.setProps({ modelValue: 3 })

    expect(previous().attributes('disabled')).toBeUndefined()
    expect(next().attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('stays put while disabled', async () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 5, disabled: true } })
    expect(wrapper.findAll('.gt-pagination__page:not([disabled])')).toHaveLength(0)

    await wrapper.findAll('.gt-pagination__page')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('cuts a long range down with inert gaps', () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 20, modelValue: 10 } })
    const gaps = wrapper.findAll('.gt-pagination__gap')

    expect(numbers(wrapper)).toEqual(['1', '9', '10', '11', '20'])
    expect(gaps).toHaveLength(2)
    expect(gaps[0].attributes('aria-hidden')).toBe('true')
    expect(gaps[0].element.tagName).toBe('SPAN')
    wrapper.unmount()
  })

  it('leaves a short range whole', () => {
    const wrapper = mount(GlassPagination, { props: { pageCount: 5, modelValue: 3 } })
    expect(numbers(wrapper)).toEqual(['1', '2', '3', '4', '5'])
    expect(wrapper.findAll('.gt-pagination__gap')).toHaveLength(0)
    wrapper.unmount()
  })

  it('renders the number when a gap would only cover a single page', () => {
    // Four pages from the first one leaves page three between the sibling
    // window and the last boundary, and a gap there would hide exactly it.
    const wrapper = mount(GlassPagination, { props: { pageCount: 4, modelValue: 1 } })
    expect(numbers(wrapper)).toEqual(['1', '2', '3', '4'])
    expect(wrapper.findAll('.gt-pagination__gap')).toHaveLength(0)
    wrapper.unmount()
  })

  it('follows the sibling and boundary counts', () => {
    const wrapper = mount(GlassPagination, {
      props: { pageCount: 30, modelValue: 15, siblingCount: 2, boundaryCount: 2 },
    })
    expect(numbers(wrapper)).toEqual(['1', '2', '13', '14', '15', '16', '17', '29', '30'])
    wrapper.unmount()
  })
})
