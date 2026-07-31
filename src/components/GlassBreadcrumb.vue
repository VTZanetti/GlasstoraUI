<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassBreadcrumbItem, GlassBreadcrumbProps } from '../types'

const props = withDefaults(defineProps<GlassBreadcrumbProps>(), {
  maxItems: 0,
  separator: '/',
  label: 'Breadcrumb',
  expandLabel: 'Show all pages',
  size: 'md',
})

const { surfaceAttrs } = useGlassSurface({ radius: 'sm', grain: false })

type TrailEntry =
  | { kind: 'item'; key: string; item: GlassBreadcrumbItem; index: number; last: boolean }
  | { kind: 'collapse'; key: string }

const expanded = ref(false)

// Counting rather than measuring. A trail that collapses on width has to render
// twice and reflow to decide, and the answer changes under a container query
// nothing here can observe.
const collapsed = computed(
  () => !expanded.value && props.maxItems > 0 && props.items.length > props.maxItems,
)

const entries = computed<TrailEntry[]>(() => {
  const items = props.items
  const total = items.length
  const entry = (item: GlassBreadcrumbItem, index: number): TrailEntry => ({
    kind: 'item',
    key: `item-${index}`,
    item,
    index,
    last: index === total - 1,
  })

  if (!collapsed.value) return items.map(entry)

  // One tail item at the very least, so a collapsed trail never hides the page
  // the reader is on, whatever maxItems says.
  const tail = Math.max(1, props.maxItems - 1)
  const start = total - tail
  return [
    entry(items[0], 0),
    { kind: 'collapse', key: 'collapse' },
    ...items.slice(start).map((item, offset) => entry(item, start + offset)),
  ]
})

// A new trail is a new page, and the expansion belonged to the old one.
watch(
  () => props.items,
  () => {
    expanded.value = false
  },
)
</script>

<template>
  <nav
    class="gt-breadcrumb"
    :class="`gt-breadcrumb--${size}`"
    :aria-label="label"
    v-bind="surfaceAttrs"
  >
    <ol class="gt-breadcrumb__list">
      <li
        v-for="(entry, position) in entries"
        :key="entry.key"
        class="gt-breadcrumb__item"
        :aria-current="entry.kind === 'item' && entry.last ? 'page' : undefined"
      >
        <span v-if="position > 0" class="gt-breadcrumb__separator" aria-hidden="true">
          <slot name="separator">{{ separator }}</slot>
        </span>
        <button
          v-if="entry.kind === 'collapse'"
          class="gt-breadcrumb__expand"
          type="button"
          :aria-label="expandLabel"
          @click="expanded = true"
        >
          …
        </button>
        <slot v-else name="item" :item="entry.item" :index="entry.index" :last="entry.last">
          <a
            v-if="entry.item.href && !entry.last"
            class="gt-breadcrumb__link"
            :href="entry.item.href"
            >{{ entry.item.label }}</a
          >
          <span v-else class="gt-breadcrumb__label">{{ entry.item.label }}</span>
        </slot>
      </li>
    </ol>
  </nav>
</template>

<style src="./GlassBreadcrumb.css"></style>
