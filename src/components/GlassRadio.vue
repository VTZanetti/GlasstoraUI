<script setup lang="ts">
import { computed, inject } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { radioGroupKey } from '../internal/keys'
import { useGlassId } from '../internal/useId'
import type { GlassRadioProps } from '../types'

const props = withDefaults(defineProps<GlassRadioProps>(), {
  disabled: false,
  id: '',
})

const group = inject(radioGroupKey, null)
const generatedId = useGlassId('gt-radio')

const { surfaceAttrs } = useGlassSurface({ radius: 'full', grain: false })

const checked = computed(() => group?.value.value === props.value)
const disabled = computed(() => props.disabled || Boolean(group?.disabled.value))
const size = computed(() => group?.size.value ?? 'md')

function select() {
  if (disabled.value) return
  group?.select(props.value)
}
</script>

<template>
  <button
    :id="id || generatedId"
    class="gt-radio"
    :class="[`gt-radio--${size}`, { 'gt-radio--on': checked }]"
    type="button"
    role="radio"
    :aria-checked="checked"
    :disabled="disabled"
    :name="group?.name.value"
    :data-value="String(value)"
    @click="select"
  >
    <span class="gt-radio__box" v-bind="surfaceAttrs">
      <span class="gt-radio__dot" aria-hidden="true" />
    </span>
    <span v-if="$slots.default" class="gt-radio__label"><slot /></span>
  </button>
</template>

<style src="./GlassRadio.css"></style>
