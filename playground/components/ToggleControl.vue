<script setup lang="ts">
import { GlassSwitch } from 'glasstora'

defineProps<{ label: string; modelValue: boolean; disabled?: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <GlassSwitch
    size="sm"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <span class="toggle__label">{{ label }}</span>
  </GlassSwitch>
</template>

<style scoped>
.toggle__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>
