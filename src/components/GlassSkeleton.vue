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

<style>
@layer glasstora {
  .gt-skeleton {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .gt-skeleton__bar {
    display: block;
    height: 0.9em;
    overflow: hidden;
    position: relative;
  }

  /* The sweep runs along the light direction, so it agrees with every other
     surface instead of inventing an angle of its own. */
  .gt-skeleton__sweep {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      var(--gt-light-angle),
      transparent 30%,
      rgb(255 255 255 / calc(0.12 * var(--gt-light-energy))) 50%,
      transparent 70%
    );
    background-size: 220% 100%;
    animation: gt-skeleton-sweep 1.6s var(--gt-ease) infinite;
  }

  @keyframes gt-skeleton-sweep {
    from {
      background-position: 140% 0;
    }
    to {
      background-position: -40% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-skeleton__sweep {
      animation: none;
    }
  }
}
</style>
