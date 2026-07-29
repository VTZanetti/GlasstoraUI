<script setup lang="ts">
import { computed, provide } from 'vue'
import { fieldKey } from '../internal/keys'
import { useGlassId } from '../internal/useId'
import type { GlassFieldProps } from '../types'

const props = withDefaults(defineProps<GlassFieldProps>(), {
  label: '',
  description: '',
  error: '',
  required: false,
  id: '',
})

const generated = useGlassId('gt-field')

const controlId = computed(() => props.id || generated)
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description) ids.push(`${controlId.value}-description`)
  if (props.error) ids.push(`${controlId.value}-error`)
  return ids.length ? ids.join(' ') : undefined
})

/**
 * The control inside reads this instead of taking the same three props over
 * again. It is what lets GlassInput, GlassTextarea and GlassCheckbox all pick
 * up a label, a description and an error state from one wrapper.
 */
provide(fieldKey, {
  id: controlId,
  describedBy,
  invalid: computed(() => Boolean(props.error)),
  required: computed(() => props.required),
})
</script>

<template>
  <div class="gt-field" :class="{ 'gt-field--invalid': Boolean(error) }">
    <label v-if="label" class="gt-field__label" :for="controlId">
      {{ label }}
      <span v-if="required" class="gt-field__required" aria-hidden="true">*</span>
    </label>
    <div class="gt-field__control">
      <slot :id="controlId" />
    </div>
    <p v-if="description" :id="`${controlId}-description`" class="gt-field__description">
      {{ description }}
    </p>
    <p v-if="error" :id="`${controlId}-error`" class="gt-field__error">{{ error }}</p>
  </div>
</template>

<style>
@layer glasstora {
  .gt-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-sm);
  }

  .gt-field__label {
    color: var(--gt-fg-muted);
    letter-spacing: 0.06em;
    text-transform: lowercase;
    cursor: pointer;
  }

  .gt-field__required {
    color: var(--gt-fg);
  }

  .gt-field__control {
    display: flex;
    flex-direction: column;
  }

  .gt-field__description,
  .gt-field__error {
    margin: 0;
    line-height: 1.6;
  }

  .gt-field__description {
    color: var(--gt-fg-faint);
  }

  /* Monochrome, so the error reads by weight and a marker rather than by red. */
  .gt-field__error {
    color: var(--gt-fg);
    padding-left: 12px;
    position: relative;
  }

  .gt-field__error::before {
    content: '!';
    position: absolute;
    left: 0;
    font-weight: 700;
  }
}
</style>
