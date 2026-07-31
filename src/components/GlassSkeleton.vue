<script setup lang="ts">
import { computed } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassSkeletonProps } from '../types'

const props = withDefaults(defineProps<GlassSkeletonProps>(), {
  width: '100%',
  height: '',
  radius: 'sm',
  lines: 1,
})

const { surfaceAttrs } = useGlassSurface({
  radius: () => props.radius,
  ring: false,
  grain: false,
})

const rows = computed(() => Math.max(1, props.lines))

/** The last line of a paragraph is short, which is what makes it read as text. */
function widthFor(index: number): string {
  if (props.height || rows.value === 1) return props.width
  return index === rows.value - 1 ? '62%' : props.width
}
</script>

<template>
  <div class="gt-skeleton" aria-hidden="true">
    <span
      v-for="i in rows"
      :key="i"
      class="gt-skeleton__bar"
      v-bind="surfaceAttrs"
      :style="{ width: widthFor(i - 1), height: height || undefined }"
    >
      <!-- A real element, not a pseudo. ::before is the grain and ::after is
           the ring, and both are already spoken for on a glass surface. -->
      <span class="gt-skeleton__sweep" />
    </span>
  </div>
</template>

<style src="./GlassSkeleton.css"></style>
