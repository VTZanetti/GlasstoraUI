<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useDismissable } from '../composables/useDismissable'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { useFieldControl } from '../internal/useFieldControl'
import { useGlassId } from '../internal/useId'
import type { GlassSelectOption, GlassSelectProps } from '../types'

const props = withDefaults(defineProps<GlassSelectProps>(), {
  modelValue: undefined,
  placeholder: 'Select…',
  placement: 'bottom-start',
  disabled: false,
  size: 'md',
  id: '',
  name: '',
  invalid: false,
  required: false,
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null]
  open: []
  close: []
}>()

const listId = useGlassId('gt-select-list')
const open = ref(false)
const control = useFieldControl(props, 'gt-select')

const { value, setValue } = useControllable<string | number | null>(
  () => props.modelValue,
  (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
  null,
)

const { anchorAttrs, anchorRef, floatingRef, placement } = useFloating({
  placement: () => props.placement,
  offset: 6,
  open,
  onHidden: () => setOpen(false),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, elevation: 2, radius: 'md' })

const selected = computed(() => props.options.find((option) => option.value === value.value))

const optionId = (index: number) => `${listId}-option-${index}`

const roving = useRovingTabIndex({
  container: floatingRef,
  selector: '[role="option"]',
  // The focus stays on the trigger, so the list is driven by reference. That is
  // also what keeps a teleported panel from stealing focus out of a dialog.
  focus: 'activedescendant',
  activation: 'manual',
  typeahead: true,
  onActivate: (element) => {
    const index = Number(element.dataset.index)
    const option = props.options[index]
    if (option && !option.disabled) choose(option)
  },
})

/** The panel is never narrower than what it drops out of. */
const minWidth = ref('0px')

function setOpen(next: boolean) {
  if (props.disabled || next === open.value) return
  open.value = next
  if (next) {
    emit('open')
  } else {
    emit('close')
    anchorRef.value?.focus()
  }
}

function choose(option: GlassSelectOption) {
  setValue(option.value)
  setOpen(false)
}

useDismissable({
  open,
  inside: [anchorRef, floatingRef],
  onDismiss: () => setOpen(false),
})

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      setOpen(true)
    }
    return
  }

  if (event.key === 'Tab') {
    setOpen(false)
    return
  }
  roving.onKeydown(event)
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  minWidth.value = `${anchorRef.value?.offsetWidth ?? 0}px`
  await nextTick()
  roving.refresh()
  const current = props.options.findIndex((option) => option.value === value.value)
  const first = props.options.findIndex((option) => !option.disabled)
  roving.setActive(current === -1 ? Math.max(first, 0) : current)
})
</script>

<template>
  <span class="gt-select">
    <button
      :id="control.id.value"
      class="gt-select__trigger"
      :class="[`gt-select__trigger--${size}`, { 'gt-select__trigger--empty': !selected }]"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="open ? roving.activeId.value : undefined"
      :aria-label="label || undefined"
      :aria-describedby="control.describedBy.value"
      :aria-invalid="control.invalid.value || undefined"
      :aria-required="control.required.value || undefined"
      :disabled="disabled"
      v-bind="anchorAttrs"
      @click="setOpen(!open)"
      @keydown="onTriggerKeydown"
    >
      <span class="gt-select__value">
        <slot v-if="selected" name="selected" :option="selected">{{ selected.label }}</slot>
        <template v-else>{{ placeholder }}</template>
      </span>
      <span class="gt-select__caret" aria-hidden="true">▾</span>
    </button>

    <input v-if="name" type="hidden" :name="name" :value="value ?? ''" />

    <Teleport to="body">
      <Transition name="gt-select">
        <div
          v-if="open"
          :id="listId"
          class="gt-select__list"
          :class="`gt-select__list--${placement.split('-')[0]}`"
          role="listbox"
          :aria-label="label || placeholder"
          :style="{ minWidth }"
          v-bind="surfaceAttrs"
        >
          <div
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option.value"
            class="gt-select__option"
            :class="{
              'gt-select__option--on': option.value === value,
              'gt-select__option--active': roving.activeIndex.value === index,
            }"
            role="option"
            :aria-selected="option.value === value"
            :aria-disabled="option.disabled || undefined"
            :data-index="index"
            @click="option.disabled || choose(option)"
            @pointermove="option.disabled || roving.setActive(index)"
          >
            <slot name="option" :option="option" :selected="option.value === value">
              {{ option.label }}
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./GlassSelect.css"></style>
