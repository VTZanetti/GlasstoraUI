<script setup lang="ts">
import { computed, provide, ref, watch, nextTick } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { useFieldControl } from '../internal/useFieldControl'
import { radioGroupKey } from '../internal/keys'
import type { GlassRadioGroupProps } from '../types'

const props = withDefaults(defineProps<GlassRadioGroupProps>(), {
  modelValue: undefined,
  name: '',
  orientation: 'vertical',
  disabled: false,
  size: 'md',
  id: '',
  invalid: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const listRef = ref<HTMLElement | null>(null)

// The group owns the value and the name; a radio only knows what it is worth.
// Undefined rather than empty string as the default, so nothing starts checked.
const { value, setValue } = useControllable<string | number | undefined>(
  () => props.modelValue,
  (next) => {
    if (next === undefined) return
    emit('update:modelValue', next)
    emit('change', next)
  },
  undefined,
)

// The field wraps the group, not the radios: one GlassField carries one id, and
// three controls claiming it would point every description at the same place.
const control = useFieldControl(props, 'gt-radio-group')

const roving = useRovingTabIndex({
  container: listRef,
  selector: '[role="radio"]',
  orientation: () => props.orientation,
  // Arrows both move and select, which is what a radio group does.
  activation: 'automatic',
  onActivate: (element) => {
    const next = element.dataset.value
    if (next !== undefined) select(coerce(next))
  },
})

/** Datasets are strings, so a numeric group has to get its numbers back. */
function coerce(raw: string): string | number {
  const match = props.modelValue ?? value.value
  return typeof match === 'number' ? Number(raw) : raw
}

function select(next: string | number) {
  if (props.disabled) return
  setValue(next)
}

provide(radioGroupKey, {
  value: computed(() => value.value),
  select,
  name: computed(() => props.name || undefined),
  size: computed(() => props.size),
  disabled: computed(() => props.disabled),
})

// The tab stop belongs to the checked radio, so tabbing into a group that has
// an answer lands on that answer rather than on the first option.
watch(
  [value, listRef],
  async () => {
    await nextTick()
    const items = roving.items()
    if (!items.length) return
    const checked = items.findIndex((item) => item.getAttribute('aria-checked') === 'true')
    roving.setActive(checked === -1 ? 0 : checked)
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <div
    :id="control.id.value"
    ref="listRef"
    class="gt-radio-group"
    :class="[`gt-radio-group--${orientation}`, `gt-radio-group--${size}`]"
    role="radiogroup"
    :aria-describedby="control.describedBy.value"
    :aria-invalid="control.invalid.value || undefined"
    :aria-required="control.required.value || undefined"
    :aria-disabled="disabled || undefined"
    @keydown="roving.onKeydown"
  >
    <slot />
  </div>
</template>

<style src="./GlassRadioGroup.css"></style>
