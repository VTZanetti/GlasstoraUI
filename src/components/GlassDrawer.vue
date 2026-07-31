<script setup lang="ts">
import { computed, mergeProps, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { trapFocus } from '../internal/focusTrap'
import { lockScroll } from '../internal/scrollLock'
import { useGlassId } from '../internal/useId'
import { useDismissable } from '../composables/useDismissable'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassDrawerProps } from '../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GlassDrawerProps>(), {
  side: 'right',
  size: '20rem',
  title: '',
  closeOnOverlay: true,
  closeOnEsc: true,
  closable: true,
  closeLabel: 'Close',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

const slots = defineSlots<{
  default?: () => unknown
  header?: () => unknown
  footer?: () => unknown
}>()

const panelRef = ref<HTMLElement | null>(null)
const titleId = useGlassId('gt-drawer-title')

// Pointing at the heading beats repeating the string in an aria-label, but only
// when the heading is the one this component renders.
const ownTitle = computed(() => Boolean(props.title) && !slots.header)

// The panel slides in on a transform, which puts its own rect out of date on
// every frame of the transition. Measuring it each frame is what stops the
// highlight from sliding off while the panel moves. No radius here: the corners
// depend on which edge the drawer is attached to, so the CSS owns them.
const { surfaceAttrs } = useGlassSurface({
  el: panelRef,
  elevation: 3,
  volatile: () => props.modelValue,
})

// The panel is teleported, so it carries the consumer's attributes rather than
// the component root. mergeProps is what keeps a class from the consumer and
// the glass classes both, instead of one replacing the other.
const attrs = useAttrs()
const panelAttrs = computed(() => mergeProps(surfaceAttrs.value, attrs))
let releaseTrap: (() => void) | undefined
let releaseScroll: (() => void) | undefined
let prevActive: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
  emit('close')
}

// Esc and outside click come from the same composable the modal uses, so the
// dismissal behaviour cannot drift between the two. The overlay covers the
// whole page, which is what makes any outside pointerdown land on it.
useDismissable({
  open: () => props.modelValue,
  inside: [panelRef],
  escape: () => props.closeOnEsc,
  outside: () => props.closeOnOverlay,
  onDismiss: close,
})

function teardown() {
  releaseTrap?.()
  releaseTrap = undefined
  releaseScroll?.()
  releaseScroll = undefined
  if (typeof document === 'undefined') return
  prevActive?.focus?.()
  prevActive = null
}

watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      prevActive = document.activeElement as HTMLElement | null
      // Counted upstream, so a drawer over a modal releases the page only when
      // the last of the two closes.
      releaseScroll = lockScroll()
      await nextTick()
      if (panelRef.value) {
        releaseTrap = trapFocus(panelRef.value)
        panelRef.value.focus()
      }
    } else {
      teardown()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (props.modelValue) teardown()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="gt-drawer">
      <div
        v-if="modelValue"
        class="gt-drawer"
        :class="`gt-drawer--${side}`"
        :style="{ '--gt-drawer-size': size }"
      >
        <div class="gt-drawer__overlay" />
        <div
          class="gt-drawer__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="ownTitle ? titleId : undefined"
          :aria-label="ownTitle ? undefined : title || undefined"
          tabindex="-1"
          v-bind="panelAttrs"
        >
          <!-- Rendered for a closable drawer with no title either, so a panel
               without a heading still has a way out other than Esc. -->
          <header v-if="title || $slots.header || closable" class="gt-drawer__header">
            <slot name="header">
              <h2 v-if="title" :id="titleId" class="gt-drawer__title">{{ title }}</h2>
              <span v-else />
            </slot>
            <button
              v-if="closable"
              class="gt-drawer__close"
              type="button"
              :aria-label="closeLabel"
              @click="close()"
            >
              ✕
            </button>
          </header>
          <div class="gt-drawer__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="gt-drawer__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./GlassDrawer.css"></style>
