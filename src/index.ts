import './styles/index.css'

export { default as GlassProvider } from './components/GlassProvider.vue'
export { default as GlassSurface } from './components/GlassSurface.vue'
export { default as GlassButton } from './components/GlassButton.vue'
export { default as GlassInput } from './components/GlassInput.vue'
export { default as GlassSwitch } from './components/GlassSwitch.vue'
export { default as GlassKbd } from './components/GlassKbd.vue'
export { default as GlassBadge } from './components/GlassBadge.vue'
export { default as GlassProgress } from './components/GlassProgress.vue'
export { default as GlassModal } from './components/GlassModal.vue'
export { default as GlassTerminal } from './components/GlassTerminal.vue'

export { useGlassLight } from './composables/useGlassLight'
export {
  detectRefraction,
  prefersReducedMotion,
  hasCoarsePointer,
} from './composables/capabilities'

export type { GlassLight, GlassLightMode, GlassConfig } from './internal/keys'
export type {
  GlassSize,
  GlassProviderProps,
  GlassSurfaceProps,
  GlassButtonProps,
  GlassInputProps,
  GlassSwitchProps,
  GlassBadgeProps,
  GlassProgressProps,
  GlassModalProps,
  GlassTerminalProps,
} from './types'

export const VERSION = '0.1.0'
