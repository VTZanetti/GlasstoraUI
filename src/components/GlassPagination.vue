<script setup lang="ts">
import { computed } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassPaginationProps } from '../types'

const props = withDefaults(defineProps<GlassPaginationProps>(), {
  modelValue: undefined,
  siblingCount: 1,
  boundaryCount: 1,
  disabled: false,
  size: 'md',
  label: 'Pagination',
  previousLabel: 'Previous page',
  nextLabel: 'Next page',
  pageLabel: (page: number) => String(page),
})

const emit = defineEmits<{ 'update:modelValue': [value: number]; change: [value: number] }>()

const { surfaceAttrs } = useGlassSurface({ radius: 'sm', grain: false })

// Works with or without v-model. Passing modelValue takes control, leaving it
// out lets the component keep the page itself.
const { value: model, setValue } = useControllable(
  () => props.modelValue,
  (value) => emit('update:modelValue', value),
  1,
)

const total = computed(() => Math.max(1, Math.floor(props.pageCount || 1)))
const current = computed(() => clamp(model.value, 1, total.value))
const pages = computed(() =>
  pageWindow(current.value, total.value, props.siblingCount, props.boundaryCount),
)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.floor(value), min), max)
}

/**
 * The pages to render in order, with 'gap' standing for a run that was left
 * out.
 *
 * Pure so the rule can be reasoned about on its own: the boundaries and the
 * siblings decide which numbers are wanted, and everything else follows from
 * the distance between two consecutive ones.
 */
function pageWindow(
  current: number,
  pageCount: number,
  siblingCount: number,
  boundaryCount: number,
): (number | 'gap')[] {
  const total = Math.max(0, Math.floor(pageCount))
  if (total === 0) return []

  const boundary = Math.max(0, Math.floor(boundaryCount))
  const siblings = Math.max(0, Math.floor(siblingCount))
  const page = clamp(current, 1, total)

  const wanted = new Set<number>()
  for (let i = 1; i <= Math.min(boundary, total); i++) wanted.add(i)
  for (let i = Math.max(total - boundary + 1, 1); i <= total; i++) wanted.add(i)
  for (let i = page - siblings; i <= page + siblings; i++) {
    if (i >= 1 && i <= total) wanted.add(i)
  }

  const sorted = [...wanted].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((value, position) => {
    if (position > 0) {
      const previous = sorted[position - 1]
      const missing = value - previous - 1
      // A gap hiding a single page takes the same room as the page and costs a
      // click, so the number goes in instead.
      if (missing === 1) result.push(previous + 1)
      else if (missing > 1) result.push('gap')
    }
    result.push(value)
  })
  return result
}

function goTo(page: number) {
  if (props.disabled) return
  const next = clamp(page, 1, total.value)
  if (next === current.value) return
  setValue(next)
  emit('change', next)
}
</script>

<template>
  <nav
    class="gt-pagination"
    :class="`gt-pagination--${size}`"
    :aria-label="label"
    v-bind="surfaceAttrs"
  >
    <button
      class="gt-pagination__nav gt-pagination__nav--previous"
      type="button"
      :aria-label="previousLabel"
      :disabled="disabled || current <= 1"
      @click="goTo(current - 1)"
    >
      ‹
    </button>
    <template v-for="(entry, position) in pages" :key="entry === 'gap' ? `gap-${position}` : entry">
      <span v-if="entry === 'gap'" class="gt-pagination__gap" aria-hidden="true">…</span>
      <button
        v-else
        class="gt-pagination__page"
        :class="{ 'gt-pagination__page--current': entry === current }"
        type="button"
        :aria-current="entry === current ? 'page' : undefined"
        :aria-label="pageLabel(entry)"
        :disabled="disabled"
        @click="goTo(entry)"
      >
        {{ entry }}
      </button>
    </template>
    <button
      class="gt-pagination__nav gt-pagination__nav--next"
      type="button"
      :aria-label="nextLabel"
      :disabled="disabled || current >= total"
      @click="goTo(current + 1)"
    >
      ›
    </button>
  </nav>
</template>

<style src="./GlassPagination.css"></style>
