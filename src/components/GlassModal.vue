<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { trapFocus } from '../internal/focusTrap'
import type { GlassModalProps } from '../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GlassModalProps>(), {
  title: '',
  width: '28rem',
  closeOnOverlay: true,
  closeOnEsc: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

const panelRef = ref<HTMLElement | null>(null)
let releaseTrap: (() => void) | undefined
let prevActive: HTMLElement | null = null
let prevOverflow = ''

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEsc) {
    e.stopPropagation()
    close()
  }
}

function teardown() {
  releaseTrap?.()
  releaseTrap = undefined
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = prevOverflow
  prevActive?.focus?.()
  prevActive = null
}

watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      prevActive = document.activeElement as HTMLElement | null
      prevOverflow = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
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
    <Transition name="gt-modal">
      <div v-if="modelValue" class="gt-modal">
        <div class="gt-modal__overlay" @click="closeOnOverlay && close()" />
        <div
          ref="panelRef"
          class="gt-modal__panel gt-glass gt-elev-3"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
          :style="{ width }"
          tabindex="-1"
          v-bind="$attrs"
        >
          <header v-if="title || $slots.header" class="gt-modal__header">
            <slot name="header">
              <h2 class="gt-modal__title">{{ title }}</h2>
            </slot>
            <button class="gt-modal__close" type="button" aria-label="Fechar" @click="close()">
              ✕
            </button>
          </header>
          <div class="gt-modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="gt-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.gt-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: var(--gt-font-mono);
}

.gt-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.6);
}

.gt-modal__panel {
  position: relative;
  z-index: 1;
  max-width: 100%;
  max-height: calc(100vh - 48px);
  overflow: auto;
  color: var(--gt-fg);
  border-radius: var(--gt-radius-lg);
  outline: none;
}

.gt-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 0;
}

.gt-modal__title {
  margin: 0;
  font-size: var(--gt-text-lg);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.gt-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--gt-radius-sm);
  color: var(--gt-fg-muted);
  font-family: inherit;
  font-size: var(--gt-text-sm);
  cursor: pointer;
  transition: color var(--gt-dur-1) var(--gt-ease);
}

.gt-modal__close:hover {
  color: var(--gt-fg);
}

.gt-modal__body {
  padding: 16px 20px;
  color: var(--gt-fg-muted);
  line-height: 1.7;
}

.gt-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px;
}

/* Transição */
.gt-modal-enter-active,
.gt-modal-leave-active {
  transition: opacity var(--gt-dur-2) var(--gt-ease);
}

.gt-modal-enter-active .gt-modal__panel,
.gt-modal-leave-active .gt-modal__panel {
  transition: transform var(--gt-dur-2) var(--gt-ease);
}

.gt-modal-enter-from,
.gt-modal-leave-to {
  opacity: 0;
}

.gt-modal-enter-from .gt-modal__panel,
.gt-modal-leave-to .gt-modal__panel {
  transform: translateY(8px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .gt-modal-enter-active,
  .gt-modal-leave-active,
  .gt-modal-enter-active .gt-modal__panel,
  .gt-modal-leave-active .gt-modal__panel {
    transition: none !important;
  }
}
</style>
