export type GlassSize = 'sm' | 'md' | 'lg'

export interface GlassProviderProps {
  /** 'auto' probes browser support, 'on' forces it, 'off' disables it. */
  refraction?: 'auto' | 'on' | 'off'
  /** Displacement strength. Values between 12 and 40 stay subtle. */
  refractionStrength?: number
  /** Whether the light follows the pointer. Touch devices drift instead. */
  trackPointer?: boolean
  /** Film grain overlay on glass surfaces. */
  grain?: boolean
}

export interface GlassSurfaceProps {
  elevation?: 0 | 1 | 2 | 3
  interactive?: boolean
  radius?: 'sm' | 'md' | 'lg'
  as?: string
}

export interface GlassButtonProps {
  variant?: 'solid' | 'ghost'
  size?: GlassSize
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface GlassInputProps {
  modelValue?: string
  size?: GlassSize
  type?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** Renders a shell style prompt prefix. */
  prompt?: boolean
  /** Replaces the native caret with a blinking block character. */
  blockCaret?: boolean
}

export interface GlassSwitchProps {
  modelValue?: boolean
  disabled?: boolean
  size?: GlassSize
}

export interface GlassBadgeProps {
  variant?: 'neutral' | 'outline' | 'solid'
  dot?: boolean
  pulse?: boolean
}

export interface GlassProgressProps {
  value?: number
  max?: number
  /** 'line' renders a thin bar, 'ascii' renders block characters. */
  mode?: 'line' | 'ascii'
  /** Column count used by the ascii mode. */
  cols?: number
  showValue?: boolean
  indeterminate?: boolean
  size?: GlassSize
}

export interface GlassModalProps {
  modelValue: boolean
  title?: string
  width?: string
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
}

export interface GlassTerminalProps {
  title?: string
  /** Lines typed out by the typewriter. Falls back to the default slot. */
  lines?: string[]
  typewriter?: boolean
  /** Milliseconds per character. */
  speed?: number
  prompt?: string
  scanlines?: boolean
}
