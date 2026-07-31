<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useDismissable } from '../composables/useDismissable'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { matchesQuery } from '../internal/matchQuery'
import { useFieldControl } from '../internal/useFieldControl'
import { useGlassId } from '../internal/useId'
import type { GlassComboboxProps, GlassSelectOption } from '../types'

const props = withDefaults(defineProps<GlassComboboxProps>(), {
  modelValue: undefined,
  placeholder: 'Search…',
  placement: 'bottom-start',
  disabled: false,
  size: 'md',
  id: '',
  name: '',
  invalid: false,
  required: false,
  label: '',
  filter: undefined,
  noResultsLabel: 'No results',
  allowCustomValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null]
  open: []
  close: []
}>()

const listId = useGlassId('gt-combobox-list')
const open = ref(false)
const control = useFieldControl(props, 'gt-combobox')

const { value, setValue } = useControllable<string | number | null>(
  () => props.modelValue,
  (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
  null,
)

/** The text in the box, which is the query as well as the display value. */
const query = ref('')

// The list only narrows once the text has been edited. Without this, opening a
// combobox that already carries a value would filter down to that one option.
const edited = ref(false)

const selected = computed(() => props.options.find((option) => option.value === value.value))

const matches = computed(() => {
  if (!edited.value) return props.options
  return props.options.filter((option) =>
    props.filter ? props.filter(query.value, option) : matchesQuery(query.value, option.label),
  )
})

const { anchorAttrs, anchorRef, floatingRef, placement } = useFloating({
  placement: () => props.placement,
  offset: 6,
  open,
  onHidden: () => setOpen(false),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, elevation: 2, radius: 'md' })

const optionId = (index: number) => `${listId}-option-${index}`

const roving = useRovingTabIndex({
  container: floatingRef,
  // The focus stays in the input, so the list is driven by reference. Typeahead
  // is off for the same reason: the letters typed are the query.
  focus: 'activedescendant',
  activation: 'manual',
  selector: '[role="option"]',
})

/**
 * The active option, worked out from the data rather than from the DOM.
 *
 * The roving index counts the enabled items, and its own activeId caches the id
 * it read last. A filtered list changes underneath it between two renders, so
 * deriving the id here is what keeps aria-activedescendant off a node that has
 * already left the document.
 */
const enabled = computed(() => matches.value.filter((option) => !option.disabled))
const active = computed<GlassSelectOption | undefined>(
  () => enabled.value[roving.activeIndex.value],
)
const activeId = computed(() => {
  const index = active.value ? matches.value.indexOf(active.value) : -1
  return index === -1 ? undefined : optionId(index)
})

/** The panel is never narrower than the box it drops out of. */
const minWidth = ref('0px')

function setOpen(next: boolean) {
  if (props.disabled || next === open.value) return
  open.value = next
  // Split rather than picking the name inline: a union of event names does not
  // narrow to one of the emit overloads.
  if (next) emit('open')
  else emit('close')
}

/** What the input reads when nobody is editing it. */
function displayText(): string {
  if (selected.value) return selected.value.label
  return value.value === null || value.value === undefined ? '' : String(value.value)
}

function restore() {
  query.value = displayText()
  edited.value = false
}

function choose(option: GlassSelectOption) {
  setValue(option.value)
  query.value = option.label
  edited.value = false
  setOpen(false)
}

/** Settles the typed text: an option if it names one, the raw text otherwise. */
function commit() {
  const text = query.value.trim()
  const exact = props.options.find(
    (option) => !option.disabled && option.label.toLowerCase() === text.toLowerCase(),
  )
  if (exact) {
    choose(exact)
    return
  }
  if (!props.allowCustomValue) {
    restore()
    return
  }
  setValue(text === '' ? null : text)
  edited.value = false
}

function hover(option: GlassSelectOption) {
  const index = enabled.value.indexOf(option)
  if (index !== -1) roving.setActive(index)
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  edited.value = true
  setOpen(true)
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'Escape') {
    // The dismissable closes the panel. This is only the text going back.
    restore()
    return
  }

  if (event.key === 'Tab') {
    commit()
    setOpen(false)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (open.value && active.value) choose(active.value)
    else commit()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (!open.value) {
      event.preventDefault()
      setOpen(true)
      return
    }
    // Home and End are deliberately not forwarded: in a text box they belong to
    // the caret, not to the list.
    roving.onKeydown(event)
  }
}

function onBlur() {
  commit()
  setOpen(false)
}

useDismissable({
  open,
  inside: [anchorRef, floatingRef],
  onDismiss: () => setOpen(false),
})

// The text follows the value whenever nobody is editing it, which is also what
// puts the initial label in the box.
watch(
  [value, () => props.options],
  () => {
    if (!edited.value) query.value = displayText()
  },
  { immediate: true },
)

watch(open, async (isOpen) => {
  if (!isOpen) return
  minWidth.value = `${anchorRef.value?.offsetWidth ?? 0}px`
  await nextTick()
  roving.refresh()
  const current = enabled.value.findIndex((option) => option.value === value.value)
  roving.setActive(Math.max(current, 0))
})

// Every change to the filter takes the active option out of the DOM with it, so
// the index goes back to the first result.
watch(matches, async () => {
  if (!open.value) return
  await nextTick()
  roving.refresh()
  roving.setActive(0)
})
</script>

<template>
  <span class="gt-combobox">
    <input
      :id="control.id.value"
      class="gt-combobox__input"
      :class="[`gt-combobox__input--${size}`]"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="open ? activeId : undefined"
      :aria-label="label || undefined"
      :aria-describedby="control.describedBy.value"
      :aria-invalid="control.invalid.value || undefined"
      :aria-required="control.required.value || undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="query"
      v-bind="anchorAttrs"
      @input="onInput"
      @keydown="onKeydown"
      @focus="setOpen(true)"
      @click="setOpen(true)"
      @blur="onBlur"
    />

    <input v-if="name" type="hidden" :name="name" :value="value ?? ''" />

    <Teleport to="body">
      <Transition name="gt-combobox">
        <div
          v-if="open"
          :id="listId"
          class="gt-combobox__list"
          :class="`gt-combobox__list--${placement.split('-')[0]}`"
          role="listbox"
          :aria-label="label || placeholder"
          :style="{ minWidth }"
          v-bind="surfaceAttrs"
          @mousedown.prevent
        >
          <div
            v-for="(option, index) in matches"
            :id="optionId(index)"
            :key="option.value"
            class="gt-combobox__option"
            :class="{
              'gt-combobox__option--on': option.value === value,
              'gt-combobox__option--active': option === active,
            }"
            role="option"
            :aria-selected="option.value === value"
            :aria-disabled="option.disabled || undefined"
            :data-index="index"
            @click="option.disabled || choose(option)"
            @pointermove="option.disabled || hover(option)"
          >
            <slot name="option" :option="option" :selected="option.value === value">
              {{ option.label }}
            </slot>
          </div>

          <div v-if="!matches.length" class="gt-combobox__empty">
            <slot name="empty">{{ noResultsLabel }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./GlassCombobox.css"></style>
