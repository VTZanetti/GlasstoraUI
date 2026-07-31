<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useDismissable } from '../composables/useDismissable'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { useGlassId } from '../internal/useId'
import type { GlassMenuEntry, GlassMenuItem, GlassMenuProps, GlassMenuSeparator } from '../types'

const props = withDefaults(defineProps<GlassMenuProps>(), {
  modelValue: undefined,
  placement: 'bottom-start',
  offset: 6,
  disabled: false,
  size: 'md',
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [item: GlassMenuItem]
  open: []
  close: []
}>()

const menuId = useGlassId('gt-menu')

// Works with or without v-model, the same way the popover does.
const { value: open, setValue: setOpenValue } = useControllable(
  () => props.modelValue,
  (value) => emit('update:modelValue', value),
  false,
)

function isSeparator(entry: GlassMenuEntry): entry is GlassMenuSeparator {
  return 'separator' in entry && entry.separator
}

/**
 * The entries as the template needs them.
 *
 * A discriminated union rather than an optional item, so the branch that renders
 * a menu item knows it has one.
 */
type MenuRow =
  { kind: 'separator'; index: number } | { kind: 'item'; index: number; item: GlassMenuItem }

const rows = computed<MenuRow[]>(() =>
  props.items.map((entry, index) =>
    isSeparator(entry) ? { kind: 'separator', index } : { kind: 'item', index, item: entry },
  ),
)

const { anchorAttrs, anchorRef, floatingRef } = useFloating({
  placement: () => props.placement,
  offset: () => props.offset,
  open,
  onHidden: () => setOpen(false),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, elevation: 2, radius: 'md' })

const roving = useRovingTabIndex({
  container: floatingRef,
  selector: '[role="menuitem"]',
  // A menu takes the focus, unlike a listbox driven from its trigger.
  focus: 'dom',
  activation: 'manual',
  typeahead: true,
  onActivate: (element) => {
    const entry = props.items[Number(element.dataset.index)]
    if (entry && !isSeparator(entry) && !entry.disabled) select(entry)
  },
})

/**
 * The element the focus goes back to.
 *
 * The trigger arrives through a slot, so the only thing known about it is that
 * it is the focusable inside the anchor. The anchor itself is the fallback,
 * which at least keeps the focus near where the menu was.
 */
function triggerElement(): HTMLElement | null {
  const anchor = anchorRef.value
  if (!anchor) return null
  return (
    anchor.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? anchor
  )
}

function setOpen(next: boolean, restoreFocus = true) {
  if (next && props.disabled) return
  if (next === open.value) return
  setOpenValue(next)
  // Split rather than picking the name inline: a union of event names does not
  // narrow to one of the emit overloads.
  if (next) emit('open')
  else emit('close')
  if (!next && restoreFocus) triggerElement()?.focus()
}

function toggle() {
  setOpen(!open.value)
}

function select(item: GlassMenuItem) {
  if (item.disabled) return
  emit('select', item)
  setOpen(false)
}

useDismissable({
  open,
  inside: [anchorRef, floatingRef],
  onDismiss: () => setOpen(false),
})

// The panel is teleported, so nothing it fires reaches this handler: what lands
// here comes from the trigger.
function onAnchorKeydown(event: KeyboardEvent) {
  if (props.disabled || open.value) return
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return
  // Enter and Space on a button would fire a click of their own, which would
  // toggle the menu straight back shut.
  event.preventDefault()
  setOpen(true)
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    // Tab has already moved the focus on. Taking it back would fight the user.
    setOpen(false, false)
    return
  }
  roving.onKeydown(event)
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  roving.refresh()
  // A menu button opens onto its first item, however it was opened.
  roving.setActive(0, true)
})

defineExpose({ open, setOpen, toggle })
</script>

<template>
  <span class="gt-menu" v-bind="anchorAttrs" @keydown="onAnchorKeydown">
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle"
      :attrs="{ 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': menuId }"
    >
      <button
        class="gt-menu__trigger"
        type="button"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-controls="menuId"
        :disabled="disabled"
        @click="toggle"
      >
        <slot name="label">⋯</slot>
      </button>
    </slot>

    <Teleport to="body">
      <Transition name="gt-menu">
        <div
          v-if="open"
          :id="menuId"
          class="gt-menu__panel"
          :class="`gt-menu__panel--${size}`"
          role="menu"
          :aria-label="label || undefined"
          v-bind="surfaceAttrs"
          @keydown="onPanelKeydown"
        >
          <template v-for="row in rows" :key="row.index">
            <div v-if="row.kind === 'separator'" class="gt-menu__separator" role="separator" />
            <button
              v-else
              class="gt-menu__item"
              :class="{ 'gt-menu__item--danger': row.item.danger }"
              type="button"
              role="menuitem"
              :disabled="row.item.disabled"
              :data-index="row.index"
              @click="select(row.item)"
            >
              <slot name="item" :item="row.item">{{ row.item.label }}</slot>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./GlassMenu.css"></style>
