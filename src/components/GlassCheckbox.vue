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

<style src="./GlassCheckbox.css"></style>
