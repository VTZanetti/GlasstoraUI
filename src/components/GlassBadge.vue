<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassBadgeProps } from '../types'

withDefaults(defineProps<GlassBadgeProps>(), {
  variant: 'neutral',
  dot: true,
  pulse: false,
})

// Same reasoning as GlassKbd: a badge is too small for real glass, but leaving
// it out of the light entirely is exactly what made the two look unrelated.
const { surfaceAttrs } = useGlassSurface({ glass: false })
</script>

<template>
  <span
    class="gt-badge"
    :class="[`gt-badge--${variant}`, { 'gt-badge--pulse': pulse }]"
    v-bind="surfaceAttrs"
  >
    <span v-if="dot" class="gt-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style>
@layer glasstora {
  .gt-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-sm);
    letter-spacing: 0.06em;
    border-radius: var(--gt-radius-full);
    white-space: nowrap;
  }

  .gt-badge--neutral,
  .gt-badge--outline {
    background-image: linear-gradient(
      var(--gt-light-angle),
      transparent 40%,
      rgb(255 255 255 / calc(0.08 * var(--gt-light-energy))) 100%
    );
  }

  .gt-badge--neutral {
    color: var(--gt-fg);
    background-color: rgb(var(--gt-line-tint) / var(--gt-fill-alpha));
    border: 1px solid rgb(var(--gt-line-tint) / var(--gt-fill-strong-alpha));
  }

  .gt-badge--outline {
    color: var(--gt-fg-muted);
    background-color: transparent;
    border: 1px solid rgb(var(--gt-line-tint) / 0.3);
  }

  .gt-badge--solid {
    color: var(--gt-bg);
    background: var(--gt-fg);
    border: 1px solid var(--gt-fg);
  }

  .gt-badge__dot {
    width: 6px;
    height: 6px;
    border-radius: var(--gt-radius-full);
    background: currentColor;
  }

  .gt-badge--pulse .gt-badge__dot {
    animation: gt-badge-pulse 1.6s var(--gt-ease) infinite;
  }

  @keyframes gt-badge-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.25;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-badge--pulse .gt-badge__dot {
      animation: none;
    }
  }
}
</style>
