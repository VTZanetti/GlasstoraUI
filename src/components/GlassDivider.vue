<script setup lang="ts">
import type { GlassDividerProps } from '../types'

withDefaults(defineProps<GlassDividerProps>(), {
  vertical: false,
  label: '',
})
</script>

<template>
  <div
    class="gt-divider"
    :class="{ 'gt-divider--vertical': vertical, 'gt-divider--labelled': label || $slots.default }"
    role="separator"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
  >
    <span v-if="!vertical && ($slots.default || label)" class="gt-divider__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<style>
@layer glasstora {
  .gt-divider {
    display: flex;
    align-items: center;
    width: 100%;
    font-family: var(--gt-font-mono);
    /* The rule itself is the background, so a label can punch a hole in it by
       sitting on top with the page colour behind. */
    background-image: linear-gradient(
      to right,
      transparent,
      rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha)),
      transparent
    );
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 1px;
    min-height: 1px;
  }

  .gt-divider--labelled {
    justify-content: center;
    min-height: 1.6em;
  }

  .gt-divider__label {
    padding: 0 12px;
    background: var(--gt-bg);
    font-size: var(--gt-text-sm);
    letter-spacing: 0.08em;
    color: var(--gt-fg-faint);
    text-transform: lowercase;
  }

  .gt-divider--vertical {
    width: 1px;
    min-width: 1px;
    height: auto;
    align-self: stretch;
    background-image: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha)),
      transparent
    );
    background-size: 1px 100%;
  }
}
</style>
