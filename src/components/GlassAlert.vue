<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassAlertProps } from '../types'

const props = withDefaults(defineProps<GlassAlertProps>(), {
  variant: 'info',
  title: '',
  closable: false,
  closeLabel: 'Dismiss',
})

const emit = defineEmits<{ close: [] }>()

const { surfaceAttrs } = useGlassSurface({ radius: 'sm' })

/** The palette carries no colour, so the variant reads as a glyph and a rule. */
const MARKS = { info: 'i', warn: '!', error: '×', success: '✓' } as const
</script>

<template>
  <div
    class="gt-alert"
    :class="`gt-alert--${variant}`"
    v-bind="surfaceAttrs"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <span class="gt-alert__mark" aria-hidden="true">{{ MARKS[variant] }}</span>
    <div class="gt-alert__content">
      <p v-if="title" class="gt-alert__title">{{ title }}</p>
      <div v-if="$slots.default" class="gt-alert__body"><slot /></div>
    </div>
    <button
      v-if="props.closable"
      class="gt-alert__close"
      type="button"
      :aria-label="closeLabel"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<style>
@layer glasstora {
  .gt-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-sm);
    color: var(--gt-fg);
    line-height: 1.6;
    /* The left rule is what separates the variants, since nothing here is
       allowed to introduce a hue. */
    border-left-width: 2px;
  }

  .gt-alert--info {
    border-left-color: rgb(var(--gt-line-tint) / 0.3);
  }
  .gt-alert--success {
    border-left-color: rgb(var(--gt-line-tint) / 0.5);
  }
  .gt-alert--warn {
    border-left-color: rgb(var(--gt-line-tint) / 0.7);
    border-left-style: dashed;
  }
  .gt-alert--error {
    border-left-color: var(--gt-fg);
    border-left-style: double;
    border-left-width: 4px;
  }

  .gt-alert__mark {
    flex-shrink: 0;
    width: 1.4em;
    height: 1.4em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha));
    border-radius: var(--gt-radius-full);
    font-size: 0.85em;
  }

  .gt-alert__content {
    flex: 1 1 auto;
    min-width: 0;
  }

  .gt-alert__title {
    margin: 0;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .gt-alert__body {
    color: var(--gt-fg-muted);
  }

  .gt-alert__title + .gt-alert__body {
    margin-top: 4px;
  }

  .gt-alert__close {
    flex-shrink: 0;
    padding: 0 2px;
    background: transparent;
    border: none;
    color: var(--gt-fg-faint);
    font: inherit;
    cursor: pointer;
  }

  .gt-alert__close:hover {
    color: var(--gt-fg);
  }

  .gt-alert__close:focus-visible {
    outline: 1px solid rgb(var(--gt-line-tint) / var(--gt-focus-alpha));
    outline-offset: 2px;
  }
}
</style>
