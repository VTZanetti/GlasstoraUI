<script setup lang="ts">
import type { GlassSwitchProps } from '../types'

const props = withDefaults(defineProps<GlassSwitchProps>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    class="gt-switch"
    :class="[`gt-switch--${size}`, { 'gt-switch--on': modelValue }]"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="gt-switch__track gt-glass">
      <span class="gt-switch__thumb" />
    </span>
    <span v-if="$slots.default" class="gt-switch__label"><slot /></span>
  </button>
</template>

<style>
.gt-switch {
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
}

.gt-switch--on {
  color: var(--gt-fg);
}

.gt-switch__track {
  display: inline-flex;
  align-items: center;
  width: 38px;
  height: 20px;
  padding: 2px;
  border-radius: var(--gt-radius-full);
  transition: background-color var(--gt-dur-2) var(--gt-ease);
}

.gt-switch--sm .gt-switch__track {
  width: 30px;
  height: 16px;
}

.gt-switch--lg .gt-switch__track {
  width: 46px;
  height: 24px;
}

.gt-switch__thumb {
  width: 14px;
  height: 14px;
  border-radius: var(--gt-radius-sm);
  background: var(--gt-gray-7);
  transition:
    transform var(--gt-dur-2) var(--gt-ease),
    background-color var(--gt-dur-2) var(--gt-ease);
}

.gt-switch--sm .gt-switch__thumb {
  width: 10px;
  height: 10px;
}

.gt-switch--lg .gt-switch__thumb {
  width: 18px;
  height: 18px;
}

.gt-switch--on .gt-switch__track {
  --gt-glass-alpha: 0.14;
  --gt-border-alpha: 0.3;
}

.gt-switch--on .gt-switch__thumb {
  background: var(--gt-gray-9);
  transform: translateX(18px);
}

.gt-switch--sm.gt-switch--on .gt-switch__thumb {
  transform: translateX(14px);
}

.gt-switch--lg.gt-switch--on .gt-switch__thumb {
  transform: translateX(22px);
}

.gt-switch:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .gt-switch__track,
  .gt-switch__thumb {
    transition: none;
  }
}
</style>
