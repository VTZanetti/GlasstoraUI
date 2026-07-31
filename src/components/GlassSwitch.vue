<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassSwitchProps } from '../types'

const props = withDefaults(defineProps<GlassSwitchProps>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// The track is short enough that the grain reads as dirt rather than texture.
const { surfaceAttrs } = useGlassSurface({ grain: false })

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
    <span class="gt-switch__track" v-bind="surfaceAttrs">
      <span class="gt-switch__thumb" />
    </span>
    <span v-if="$slots.default" class="gt-switch__label"><slot /></span>
  </button>
</template>

<style src="./GlassSwitch.css"></style>
