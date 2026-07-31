<script setup lang="ts">
import { computed } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassSortState, GlassTableColumn, GlassTableProps } from '../types'

const props = withDefaults(defineProps<GlassTableProps>(), {
  rowKey: '',
  sort: undefined,
  sortFn: undefined,
  stickyHeader: false,
  maxHeight: '',
  emptyLabel: 'No rows',
  size: 'md',
  label: '',
})

const emit = defineEmits<{
  'update:sort': [value: GlassSortState | null]
  'row-click': [row: Record<string, unknown>, index: number]
}>()

const { surfaceAttrs } = useGlassSurface({ radius: 'md' })

const {
  value: sortState,
  setValue: setSort,
  controlled,
} = useControllable<GlassSortState | null>(
  () => props.sort,
  (value) => emit('update:sort', value),
  null,
)

const displayRows = computed(() => {
  const state = sortState.value
  // Whoever passes the sort prop owns the order of the rows as well: sorting
  // here would fight the list the consumer just handed back.
  if (controlled.value || !state) return props.rows
  const compare = props.sortFn ?? defaultCompare
  return [...props.rows].sort((a, b) => compare(a, b, state))
})

function defaultCompare(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  state: GlassSortState,
) {
  const left = a[state.key]
  const right = b[state.key]
  const direction = state.direction === 'asc' ? 1 : -1
  if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
  return String(left ?? '').localeCompare(String(right ?? '')) * direction
}

function rowKeyFor(row: Record<string, unknown>, index: number) {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  if (props.rowKey) return String(row[props.rowKey] ?? index)
  return index
}

function directionOf(column: GlassTableColumn) {
  const state = sortState.value
  return state && state.key === column.key ? state.direction : null
}

function ariaSort(column: GlassTableColumn) {
  if (!column.sortable) return undefined
  const direction = directionOf(column)
  if (!direction) return 'none'
  return direction === 'asc' ? 'ascending' : 'descending'
}

/** Ascending, then descending, then back to the order the rows arrived in. */
function toggleSort(column: GlassTableColumn) {
  const direction = directionOf(column)
  if (!direction) {
    setSort({ key: column.key, direction: 'asc' })
    return
  }
  setSort(direction === 'asc' ? { key: column.key, direction: 'desc' } : null)
}
</script>

<template>
  <div
    class="gt-table"
    :class="[`gt-table--${size}`, { 'gt-table--sticky': stickyHeader }]"
    v-bind="surfaceAttrs"
  >
    <div class="gt-table__scroll" :style="maxHeight ? { maxHeight } : undefined">
      <table class="gt-table__grid" :aria-label="label || undefined">
        <thead class="gt-table__head">
          <tr class="gt-table__row">
            <th
              v-for="column in columns"
              :key="column.key"
              class="gt-table__cell gt-table__cell--head"
              :class="[
                `gt-table__cell--${column.align ?? 'start'}`,
                { 'gt-table__cell--sorted': directionOf(column) },
              ]"
              scope="col"
              :style="column.width ? { width: column.width } : undefined"
              :aria-sort="ariaSort(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="gt-table__sort"
                @click="toggleSort(column)"
              >
                <slot :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
                <span class="gt-table__mark" aria-hidden="true">
                  {{ directionOf(column) === 'asc' ? '↑' : directionOf(column) ? '↓' : '↕' }}
                </span>
              </button>
              <slot v-else :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
            </th>
          </tr>
        </thead>
        <tbody class="gt-table__body">
          <tr v-if="!displayRows.length" class="gt-table__row">
            <td class="gt-table__cell gt-table__cell--empty" :colspan="columns.length">
              <slot name="empty">{{ emptyLabel }}</slot>
            </td>
          </tr>
          <tr
            v-for="(row, index) in displayRows"
            :key="rowKeyFor(row, index)"
            class="gt-table__row"
            @click="emit('row-click', row, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="gt-table__cell"
              :class="`gt-table__cell--${column.align ?? 'start'}`"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{
                row[column.key]
              }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style src="./GlassTable.css"></style>
