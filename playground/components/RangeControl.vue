<script setup lang="ts">
defineProps<{ label: string; modelValue: number; min?: number; max?: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function onInput(event: Event) {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <label class="range">
    <span class="range__label">{{ label }}</span>
    <input
      class="range__input"
      type="range"
      :min="min ?? 0"
      :max="max ?? 100"
      :value="modelValue"
      @input="onInput"
    />
    <span class="range__value">{{ modelValue }}</span>
  </label>
</template>

<style scoped>
.range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gt-fg-faint);
}

.range__input {
  width: 140px;
  height: 2px;
  appearance: none;
  background: rgb(var(--gt-line-tint) / 0.2);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}

.range__input::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--gt-fg);
  border-radius: 3px;
  cursor: pointer;
}

.range__input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: var(--gt-fg);
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.range__input:focus-visible {
  outline: 1px solid rgb(var(--gt-line-tint) / 0.75);
  outline-offset: 4px;
}

.range__value {
  min-width: 3ch;
  font-size: 12px;
  color: var(--gt-fg-muted);
  text-align: right;
}
</style>
