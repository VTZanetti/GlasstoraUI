import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { GlassTable } from '../index'
import { resetLightRegistry } from '../internal/lightRegistry'
import type { GlassTableColumn } from '../types'

const columns: GlassTableColumn[] = [
  { key: 'name', label: 'name', sortable: true },
  { key: 'size', label: 'size', sortable: true, align: 'end' },
  { key: 'kind', label: 'kind' },
]

const rows = [
  { name: 'beta', size: 30, kind: 'file' },
  { name: 'alpha', size: 200, kind: 'dir' },
  { name: 'gamma', size: 100, kind: 'file' },
]

/** The first column of every body row, in the order they were rendered. */
function names(wrapper: VueWrapper) {
  return wrapper.findAll('tbody tr').map((row) => row.findAll('td')[0].text())
}

afterEach(() => {
  resetLightRegistry()
})

describe('GlassTable', () => {
  it('renders a header cell per column and a body cell per value', () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })

    expect(wrapper.findAll('th')).toHaveLength(3)
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    expect(wrapper.findAll('th')[0].text()).toContain('name')
    expect(wrapper.findAll('tbody tr')[0].findAll('td')[2].text()).toBe('file')
    wrapper.unmount()
  })

  it('spans the empty state across every column', () => {
    const wrapper = mount(GlassTable, { props: { columns, rows: [] } })
    const cell = wrapper.find('tbody td')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(cell.attributes('colspan')).toBe('3')
    expect(cell.text()).toBe('No rows')
    wrapper.unmount()
  })

  it('cycles a sortable header through ascending, descending and no order', async () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })
    const header = wrapper.findAll('th')[0].find('button')

    await header.trigger('click')
    await header.trigger('click')
    await header.trigger('click')

    expect(wrapper.emitted('update:sort')).toEqual([
      [{ key: 'name', direction: 'asc' }],
      [{ key: 'name', direction: 'desc' }],
      [null],
    ])
    wrapper.unmount()
  })

  it('leaves a column without sortable unclickable', () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })
    expect(wrapper.findAll('th')[2].find('button').exists()).toBe(false)
    wrapper.unmount()
  })

  it('sorts its own rows while nobody controls the sort', async () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })
    const header = wrapper.findAll('th')[0].find('button')

    await header.trigger('click')
    expect(names(wrapper)).toEqual(['alpha', 'beta', 'gamma'])

    await header.trigger('click')
    expect(names(wrapper)).toEqual(['gamma', 'beta', 'alpha'])

    await header.trigger('click')
    expect(names(wrapper)).toEqual(['beta', 'alpha', 'gamma'])
    wrapper.unmount()
  })

  it('compares numbers as numbers rather than as text', async () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })

    await wrapper.findAll('th')[1].find('button').trigger('click')

    expect(names(wrapper)).toEqual(['beta', 'gamma', 'alpha'])
    wrapper.unmount()
  })

  it('defers to sortFn when there is one', async () => {
    const wrapper = mount(GlassTable, {
      props: {
        columns,
        rows,
        sortFn: (a: Record<string, unknown>, b: Record<string, unknown>) =>
          String(b.kind).localeCompare(String(a.kind)),
      },
    })

    await wrapper.findAll('th')[0].find('button').trigger('click')

    // By kind rather than by the column that was clicked, which is what proves
    // the default comparison never ran.
    expect(names(wrapper)).toEqual(['beta', 'gamma', 'alpha'])
    wrapper.unmount()
  })

  it('keeps the rows in the order it was given while the sort is controlled', async () => {
    const wrapper = mount(GlassTable, {
      props: { columns, rows, sort: { key: 'name', direction: 'asc' } },
    })

    // Ordering is the consumer's job once it passes the prop, so the ascending
    // state above changes the header and nothing else.
    expect(names(wrapper)).toEqual(['beta', 'alpha', 'gamma'])
    expect(wrapper.findAll('th')[0].attributes('aria-sort')).toBe('ascending')

    await wrapper.findAll('th')[0].find('button').trigger('click')

    expect(wrapper.emitted('update:sort')?.[0]).toEqual([{ key: 'name', direction: 'desc' }])
    expect(names(wrapper)).toEqual(['beta', 'alpha', 'gamma'])
    wrapper.unmount()
  })

  it('reports the ordered column through aria-sort', async () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })
    const headers = () => wrapper.findAll('th')

    expect(headers()[0].attributes('aria-sort')).toBe('none')
    expect(headers()[2].attributes('aria-sort')).toBeUndefined()

    await headers()[0].find('button').trigger('click')
    expect(headers()[0].attributes('aria-sort')).toBe('ascending')
    expect(headers()[1].attributes('aria-sort')).toBe('none')

    await headers()[0].find('button').trigger('click')
    expect(headers()[0].attributes('aria-sort')).toBe('descending')
    wrapper.unmount()
  })

  it('hands the row and its index to row-click', async () => {
    const wrapper = mount(GlassTable, { props: { columns, rows } })

    await wrapper.findAll('tbody tr')[1].trigger('click')

    expect(wrapper.emitted('row-click')?.[0]).toEqual([rows[1], 1])
    wrapper.unmount()
  })

  it('renders the cell and header slots named after the column', () => {
    const wrapper = mount(GlassTable, {
      props: { columns, rows },
      slots: {
        'header-name': '<span class="head">file name</span>',
        'cell-size': '<span class="cell">{{ params.value }} kb</span>',
      },
    })

    expect(wrapper.find('th .head').text()).toBe('file name')
    expect(wrapper.findAll('tbody tr')[0].find('.cell').text()).toBe('30 kb')
    wrapper.unmount()
  })

  it('takes the row key from the column named by rowKey', () => {
    const wrapper = mount(GlassTable, { props: { columns, rows, rowKey: 'name' } })
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    wrapper.unmount()
  })
})
