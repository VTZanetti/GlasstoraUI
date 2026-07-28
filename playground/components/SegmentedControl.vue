<script setup lang="ts">
defineProps<{ label: string; modelValue: string; options: readonly string[] }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="segmented">
    <span class="segmented__label">{{ label }}</span>
    <div class="segmented__options">
      <button
        v-for="option in options"
        :key="option"
        class="segmented__option"
        :class="{ 'segmented__option--active': option === modelValue }"
        type="button"
        @click="$emit('update:modelValue', option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  align-items: center;
  gap: 10px;
}

.segmented__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6b6b6b;
}

.segmented__options {
  display: inline-flex;
  padding: 2px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 8px;
}

.segmented__option {
  padding: 4px 10px;
  font-family: inherit;
  font-size: 12px;
  color: #6b6b6b;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 120ms ease,
    background-color 120ms ease;
}

.segmented__option:hover {
  color: #cfcfcf;
}

.segmented__option--active {
  color: #050505;
  background: #f5f5f5;
}
</style>
