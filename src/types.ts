export type GlassSize = 'sm' | 'md' | 'lg'

/** Corner rounding. Extends the size scale with the two extremes. */
export type GlassRadius = GlassSize | 'full' | 'none'

export type GlassElevation = 0 | 1 | 2 | 3

export type GlassTheme = 'dark' | 'light' | 'auto'

/** Preferred side for a floating panel. It flips when the viewport says so. */
export type GlassPlacement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

export interface GlassProviderProps {
  /** 'auto' probes browser support, 'on' forces it, 'off' disables it. */
  refraction?: 'auto' | 'on' | 'off'
  /** Displacement strength. Values between 12 and 40 stay subtle. */
  refractionStrength?: number
  /** Whether the light follows the pointer. Touch devices drift instead. */
  trackPointer?: boolean
  /** Film grain overlay on glass surfaces. */
  grain?: boolean
  /** 'auto' follows prefers-color-scheme and writes the resolved value. */
  theme?: GlassTheme
  /** Distance past a surface edge where the light stops reaching it, in px. */
  lightFalloff?: number
  /** Virtual height of the light above the page, in px. Controls the spread. */
  lightHeight?: number
  /** Multiplies the strength of every surface highlight. */
  lightGain?: number
}

export interface GlassSurfaceProps {
  elevation?: GlassElevation
  interactive?: boolean
  radius?: GlassRadius
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
  readonly?: boolean
  invalid?: boolean
  /** Forwarded to the inner input, so a label or GlassField can point at it. */
  id?: string
  name?: string
  autocomplete?: string
  required?: boolean
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

export interface GlassAvatarProps {
  /** Image source. Falls back to the initials when absent or broken. */
  src?: string
  alt?: string
  /** Name the initials are derived from. */
  name?: string
  size?: GlassSize
  square?: boolean
}

export interface GlassCardProps {
  elevation?: GlassElevation
  radius?: GlassRadius
  interactive?: boolean
  title?: string
  /** Renders the whole card as a native button. */
  as?: string
}

export interface GlassDividerProps {
  vertical?: boolean
  /** Text set into the middle of the rule. */
  label?: string
}

export interface GlassFieldProps {
  label?: string
  /** Help text rendered under the control and wired up with aria-describedby. */
  description?: string
  /** Error text. Its presence is what marks the control invalid. */
  error?: string
  required?: boolean
  /** Id given to the control. One is derived from the instance when omitted. */
  id?: string
}

export interface GlassTextareaProps {
  modelValue?: string
  rows?: number
  size?: GlassSize
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  id?: string
  name?: string
  /** Grows with its content instead of scrolling. */
  autosize?: boolean
}

export interface GlassCheckboxProps {
  modelValue?: boolean
  /** Renders the third state. Overrides the checked mark while true. */
  indeterminate?: boolean
  disabled?: boolean
  size?: GlassSize
  id?: string
  name?: string
}

export interface GlassSpinnerProps {
  size?: GlassSize
  /** Milliseconds per frame of the braille cycle. */
  speed?: number
  /** Accessible name. Set it when the spinner stands on its own. */
  label?: string
}

export interface GlassSkeletonProps {
  width?: string
  height?: string
  radius?: GlassRadius
  /** Number of stacked lines. Ignored when height is set. */
  lines?: number
}

export interface GlassAlertProps {
  variant?: 'info' | 'warn' | 'error' | 'success'
  title?: string
  /** Renders the dismiss button. */
  closable?: boolean
  closeLabel?: string
}

export interface GlassTooltipProps {
  /** Tooltip text. Use the content slot for anything richer. */
  content?: string
  placement?: GlassPlacement
  /** Milliseconds to wait before showing. */
  delay?: number
  disabled?: boolean
}

export interface GlassPopoverProps {
  modelValue?: boolean
  placement?: GlassPlacement
  /** Closes on a click outside the panel and its trigger. */
  closeOnOutside?: boolean
  closeOnEsc?: boolean
  /** Distance between the trigger and the panel, in px. */
  offset?: number
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
  /** Renders the close button. Turn it off for a dialog that must be answered. */
  closable?: boolean
  /** Accessible name of the close button. Override it to localise the dialog. */
  closeLabel?: string
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
