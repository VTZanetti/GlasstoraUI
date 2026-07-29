<script setup lang="ts">
import { computed } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useFieldControl } from '../internal/useFieldControl'
import type { GlassCheckboxProps } from '../types'

const props = withDefaults(defineProps<GlassCheckboxProps>(), {
  modelValue: false,
  indeterminate: false,
  disabled: false,
  size: 'md',
  id: '',
  name: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { surfaceAttrs } = useGlassSurface({ radius: 'sm', grain: false })
const control = useFieldControl(props, 'gt-checkbox')

const checkedState = computed(() => (props.indeterminate ? 'mixed' : props.modelValue))

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    :id="control.id.value"
    class="gt-checkbox"
    :class="[
      `gt-checkbox--${size}`,
      { 'gt-checkbox--on': modelValue || indeterminate, 'gt-checkbox--mixed': indeterminate },
    ]"
    type="button"
    role="checkbox"
    :aria-checked="checkedState"
    :aria-describedby="control.describedBy.value"
    :aria-invalid="control.invalid.value || undefined"
    :disabled="disabled"
    :name="name || undefined"
    @click="toggle"
  >
    <span class="gt-checkbox__box" v-bind="surfaceAttrs">
      <span class="gt-checkbox__mark" aria-hidden="true">{{ indeterminate ? '━' : '✓' }}</span>
    </span>
    <span v-if="$slots.default" class="gt-checkbox__label"><slot /></span>
  </button>
</template>

<style>
@layer glasstora {
  .gt-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: transparent;
    border: none;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-md);
    color: var(--gt-fg-muted);
    cursor: pointer;
    user-select: none;
    text-align: left;
  }

  .gt-checkbox--on {
    color: var(--gt-fg);
  }

  .gt-checkbox__box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    transition: background-color var(--gt-dur-2) var(--gt-ease);
  }

  .gt-checkbox--sm .gt-checkbox__box {
    width: 13px;
    height: 13px;
  }
  .gt-checkbox--lg .gt-checkbox__box {
    width: 20px;
    height: 20px;
  }

  .gt-checkbox__mark {
    font-size: 0.72em;
    line-height: 1;
    color: var(--gt-fg);
    opacity: 0;
    transform: scale(0.6);
    transition:
      opacity var(--gt-dur-1) var(--gt-ease),
      transform var(--gt-dur-1) var(--gt-ease);
  }

  .gt-checkbox--on .gt-checkbox__mark {
    opacity: 1;
    transform: scale(1);
  }

  .gt-checkbox--on .gt-checkbox__box {
    --gt-glass-alpha: 0.16;
    --gt-border-alpha: 0.34;
  }

  .gt-checkbox:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .gt-checkbox:focus-visible {
    outline: 1px solid rgb(var(--gt-line-tint) / var(--gt-focus-alpha));
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-checkbox__box,
    .gt-checkbox__mark {
      transition: none;
    }
  }
}
</style>
