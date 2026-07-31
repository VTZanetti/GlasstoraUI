<script setup lang="ts">
import { ref } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useFieldControl } from '../internal/useFieldControl'
import type { GlassInputProps } from '../types'

const props = withDefaults(defineProps<GlassInputProps>(), {
  modelValue: '',
  size: 'md',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  invalid: false,
  id: '',
  name: '',
  autocomplete: '',
  required: false,
  prompt: false,
  blockCaret: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { surfaceAttrs } = useGlassSurface()
const control = useFieldControl(props, 'gt-input')

const fieldRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const caretCol = ref(0)

function syncCaret() {
  caretCol.value = fieldRef.value?.selectionStart ?? 0
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  syncCaret()
}

function onFocus() {
  focused.value = true
  syncCaret()
}

function onBlur() {
  focused.value = false
}

// Nothing in 0.1.0 could be driven imperatively, so focusing a field after a
// failed submit meant reaching into the DOM by hand.
defineExpose({
  input: fieldRef,
  focus: (options?: FocusOptions) => fieldRef.value?.focus(options),
  blur: () => fieldRef.value?.blur(),
  select: () => fieldRef.value?.select(),
})
</script>

<template>
  <label
    class="gt-input"
    :class="[
      `gt-input--${size}`,
      {
        'gt-input--disabled': disabled,
        'gt-input--invalid': control.invalid.value,
        'gt-input--block-caret': blockCaret,
      },
    ]"
    v-bind="surfaceAttrs"
  >
    <span v-if="props.prompt" class="gt-input__prompt" aria-hidden="true">&gt;</span>
    <slot name="prefix" />
    <span class="gt-input__box">
      <input
        :id="control.id.value"
        ref="fieldRef"
        class="gt-input__field"
        :value="modelValue"
        :type="type"
        :name="name || undefined"
        :autocomplete="autocomplete || undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="control.required.value"
        :aria-invalid="control.invalid.value || undefined"
        :aria-describedby="control.describedBy.value"
        @input="onInput"
        @keyup="syncCaret"
        @click="syncCaret"
        @select="syncCaret"
        @focus="onFocus"
        @blur="onBlur"
      />
      <span
        v-if="blockCaret && focused"
        class="gt-input__caret"
        aria-hidden="true"
        :style="{ left: `${caretCol}ch` }"
        >█</span
      >
    </span>
    <slot name="suffix" />
  </label>
</template>

<style src="./GlassInput.css"></style>
