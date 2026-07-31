import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassBreadcrumb } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  resetLightRegistry()
  document.body.innerHTML = ''
})

const TRAIL = [
  { label: 'home', href: '/' },
  { label: 'projects', href: '/projects' },
  { label: 'glasstora', href: '/projects/glasstora' },
  { label: 'components', href: '/projects/glasstora/components' },
  { label: 'button' },
]

const mountTrail = (props: Record<string, unknown> = {}) =>
  mount(GlassBreadcrumb, { props: { items: TRAIL, ...props }, attachTo: document.body })

const labels = (w: VueWrapper) =>
  w.findAll('.gt-breadcrumb__item').map((item) => item.text().replace(/^\/\s*/, ''))

describe('GlassBreadcrumb', () => {
  it('is a labelled nav holding an ordered list', () => {
    wrapper = mountTrail()

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb')
    expect(wrapper.findAll('.gt-breadcrumb__item')).toHaveLength(5)
  })

  it('links every step but the one the reader is on', () => {
    wrapper = mountTrail()

    expect(wrapper.findAll('a')).toHaveLength(4)
    const last = wrapper.findAll('.gt-breadcrumb__item').at(-1)!
    expect(last.attributes('aria-current')).toBe('page')
    expect(last.find('a').exists()).toBe(false)
  })

  it('separates the steps with something screen readers skip', () => {
    wrapper = mountTrail({ separator: '›' })
    const separators = wrapper.findAll('.gt-breadcrumb__separator')

    // One fewer than the items: nothing comes before the first.
    expect(separators).toHaveLength(4)
    expect(separators[0].attributes('aria-hidden')).toBe('true')
    expect(separators[0].text()).toBe('›')
  })

  it('leaves the trail whole while it fits', () => {
    wrapper = mountTrail({ maxItems: 5 })
    expect(wrapper.find('.gt-breadcrumb__expand').exists()).toBe(false)
    expect(labels(wrapper)).toHaveLength(5)
  })

  it('drops the middle out once the trail is too long', () => {
    wrapper = mountTrail({ maxItems: 3 })

    expect(wrapper.find('.gt-breadcrumb__expand').exists()).toBe(true)
    // First, the button, then the last two.
    expect(labels(wrapper)).toEqual(['home', '…', 'components', 'button'])
  })

  it('never hides the page the reader is on', () => {
    wrapper = mountTrail({ maxItems: 1 })
    expect(labels(wrapper).at(-1)).toBe('button')
  })

  it('shows everything when the collapsed middle is opened', async () => {
    wrapper = mountTrail({ maxItems: 3 })

    await wrapper.find('.gt-breadcrumb__expand').trigger('click')
    expect(wrapper.find('.gt-breadcrumb__expand').exists()).toBe(false)
    expect(labels(wrapper)).toHaveLength(5)
  })

  it('collapses again for a new trail', async () => {
    wrapper = mountTrail({ maxItems: 3 })
    await wrapper.find('.gt-breadcrumb__expand').trigger('click')

    await wrapper.setProps({ items: [...TRAIL, { label: 'sizes' }] })
    await nextTick()

    expect(wrapper.find('.gt-breadcrumb__expand').exists()).toBe(true)
  })

  it('names the expand button in English by default and takes an override', () => {
    wrapper = mountTrail({ maxItems: 3 })
    expect(wrapper.find('.gt-breadcrumb__expand').attributes('aria-label')).toBe('Show all pages')

    wrapper.unmount()
    wrapper = mountTrail({ maxItems: 3, expandLabel: 'Mostrar tudo' })
    expect(wrapper.find('.gt-breadcrumb__expand').attributes('aria-label')).toBe('Mostrar tudo')
  })

  it('hands each step to a slot, for a router link the library knows nothing about', () => {
    wrapper = mount(GlassBreadcrumb, {
      props: { items: TRAIL },
      slots: { item: '<em class="custom">{{ params.item.label }}</em>' },
      attachTo: document.body,
    })

    expect(wrapper.findAll('.custom')).toHaveLength(5)
    // aria-current lives on the item rather than the link, which is the only
    // place it survives the consumer replacing what is inside.
    expect(wrapper.findAll('.gt-breadcrumb__item').at(-1)!.attributes('aria-current')).toBe('page')
  })

  it('renders nothing but the list when there are no items', () => {
    wrapper = mount(GlassBreadcrumb, { props: { items: [] }, attachTo: document.body })
    expect(wrapper.findAll('.gt-breadcrumb__item')).toHaveLength(0)
  })
})
