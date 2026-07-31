<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useDismissable } from '../composables/useDismissable'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useGlassId } from '../internal/useId'
import type { GlassPopoverProps } from '../types'

const props = withDefaults(defineProps<GlassPopoverProps>(), {
  modelValue: undefined,
  placement: 'bottom-start',
  closeOnOutside: true,
  closeOnEsc: true,
  offset: 8,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

const panelId = useGlassId('gt-popover')

// Works with or without v-model. Passing modelValue takes control, leaving it
// out lets the component keep its own state.
const { value: open, setValue: setOpenValue } = useControllable(
  () => props.modelValue,
  (value) => emit('update:modelValue', value),
  false,
)

const { anchorAttrs, anchorRef, floatingRef, placement } = useFloating({
  placement: () => props.placement,
  offset: () => props.offset,
  open,
  onHidden: () => setOpen(false),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, elevation: 2, radius: 'md' })

let previouslyFocused: HTMLElement | null = null

function setOpen(value: boolean) {
  if (value === open.value) return
  setOpenValue(value)
  if (!value) emit('close')
}

function toggle() {
  setOpen(!open.value)
}

useDismissable({
  open,
  inside: [anchorRef, floatingRef],
  escape: () => props.closeOnEsc,
  outside: () => props.closeOnOutside,
  onDismiss: () => setOpen(false),
})

watch(open, async (value) => {
  if (typeof document === 'undefined') return
  if (value) {
    previouslyFocused = document.activeElement as HTMLElement | null
    await nextTick()
    floatingRef.value?.focus()
  } else {
    previouslyFocused?.focus?.()
    previouslyFocused = null
  }
})

defineExpose({ open, setOpen, toggle })
</script>

<template>
  <span class="gt-popover__anchor" v-bind="anchorAttrs">
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle"
      :attrs="{ 'aria-expanded': open, 'aria-controls': panelId }"
    >
      <button
        class="gt-popover__trigger"
        type="button"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggle"
      >
        <slot name="label">…</slot>
      </button>
    </slot>
    <Teleport to="body">
      <Transition name="gt-popover">
        <div
          v-if="open"
          :id="panelId"
          class="gt-popover"
          :class="`gt-popover--${placement.split('-')[0]}`"
          role="dialog"
          tabindex="-1"
          v-bind="surfaceAttrs"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./GlassPopover.css"></style>
