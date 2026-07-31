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
  /** Frames per second of the braille cycle. Higher spins faster. */
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
  /**
   * 'line' is a thin continuous bar, 'ascii' spells the bar out in block
   * characters, 'blocks' is a row of discrete segments that light up in turn,
   * and 'dots' is the same idea at the density of a braille ramp.
   */
  mode?: 'line' | 'ascii' | 'blocks' | 'dots'
  /** Segment count used by the ascii, blocks and dots modes. */
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

export interface GlassRadioGroupProps {
  modelValue?: string | number
  /** Shared by every radio inside, so the browser groups them. */
  name?: string
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  size?: GlassSize
  id?: string
  invalid?: boolean
  required?: boolean
}

export interface GlassRadioProps {
  /** What the group reports when this one is picked. */
  value: string | number
  disabled?: boolean
  id?: string
}

export interface GlassSliderProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: GlassSize
  /** Prints the value beside the track. */
  showValue?: boolean
  /** Reads the value out for assistive technology, and prints it when shown. */
  formatValue?: (value: number) => string
  id?: string
  name?: string
  invalid?: boolean
  required?: boolean
  /** Accessible name when there is no GlassField or label pointing at it. */
  label?: string
}

export interface GlassTabItem {
  label: string
  value: string
  disabled?: boolean
}

export interface GlassTabsProps {
  modelValue?: string
  tabs: GlassTabItem[]
  /**
   * 'automatic' selects whatever the arrows land on, 'manual' waits for Enter
   * or Space. Manual is the one to use when a panel is expensive to render.
   */
  activation?: 'automatic' | 'manual'
  size?: GlassSize
  /** Accessible name of the tab list. */
  label?: string
}

export interface GlassTabPanelProps {
  /** Matches the value of the tab that reveals it. */
  value: string
}

export interface GlassAccordionItem {
  value: string
  title: string
  disabled?: boolean
}

export interface GlassAccordionProps {
  /** A single open value, or the list of them when multiple is set. */
  modelValue?: string | string[]
  items: GlassAccordionItem[]
  /** Lets more than one section stay open at a time. */
  multiple?: boolean
  size?: GlassSize
}

export interface GlassBreadcrumbItem {
  label: string
  href?: string
}

export interface GlassBreadcrumbProps {
  items: GlassBreadcrumbItem[]
  /** Collapses the middle once the trail is longer than this. 0 never does. */
  maxItems?: number
  separator?: string
  /** Accessible name of the trail. */
  label?: string
  /** Accessible name of the button that expands a collapsed trail. */
  expandLabel?: string
  size?: GlassSize
}

export interface GlassPaginationProps {
  /** The current page, counting from one. */
  modelValue?: number
  pageCount: number
  /** Pages kept either side of the current one. */
  siblingCount?: number
  /** Pages kept at each end of the range. */
  boundaryCount?: number
  disabled?: boolean
  size?: GlassSize
  label?: string
  previousLabel?: string
  nextLabel?: string
  /** Accessible name of a page button. Defaults to the page number. */
  pageLabel?: (page: number) => string
}

export interface GlassTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
}

/** Which column the rows are ordered by, and which way. */
export interface GlassSortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface GlassTableProps {
  columns: GlassTableColumn[]
  rows: Record<string, unknown>[]
  /** Column whose value identifies a row, or a function that returns the key. */
  rowKey?: string | ((row: Record<string, unknown>) => string)
  /** Bind it with v-model:sort to order the rows yourself. */
  sort?: GlassSortState | null
  /** Replaces the default comparison when the table sorts its own rows. */
  sortFn?: (a: Record<string, unknown>, b: Record<string, unknown>, sort: GlassSortState) => number
  /** Keeps the header in place while the body scrolls. Needs maxHeight. */
  stickyHeader?: boolean
  maxHeight?: string
  emptyLabel?: string
  size?: GlassSize
  label?: string
}

export interface GlassSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface GlassSelectProps {
  modelValue?: string | number | null
  options: GlassSelectOption[]
  placeholder?: string
  placement?: GlassPlacement
  disabled?: boolean
  size?: GlassSize
  id?: string
  name?: string
  invalid?: boolean
  required?: boolean
  /** Accessible name when nothing else points at the control. */
  label?: string
}

export interface GlassComboboxProps extends GlassSelectProps {
  /** Replaces the default case insensitive substring match. */
  filter?: (query: string, option: GlassSelectOption) => boolean
  /** Shown in place of the list when the query matches nothing. */
  noResultsLabel?: string
  /** Lets the typed text stand as the value when it matches no option. */
  allowCustomValue?: boolean
}

export interface GlassMenuItem {
  label: string
  value?: string
  disabled?: boolean
  /** Marks a destructive entry, which reads differently. */
  danger?: boolean
}

export interface GlassMenuSeparator {
  separator: true
}

export type GlassMenuEntry = GlassMenuItem | GlassMenuSeparator

export interface GlassMenuProps {
  modelValue?: boolean
  items: GlassMenuEntry[]
  placement?: GlassPlacement
  offset?: number
  disabled?: boolean
  size?: GlassSize
  /** Accessible name of the menu. */
  label?: string
}

export type GlassDrawerSide = 'left' | 'right' | 'top' | 'bottom'

export interface GlassDrawerProps {
  modelValue: boolean
  side?: GlassDrawerSide
  /** Width on the sides, height on the top and bottom. */
  size?: string
  title?: string
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  closable?: boolean
  closeLabel?: string
}

export type GlassToastVariant = 'info' | 'success' | 'warn' | 'error'

export type GlassToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface GlassToastOptions {
  title?: string
  message: string
  variant?: GlassToastVariant
  /** Milliseconds on screen. 0 keeps it until it is dismissed. */
  duration?: number
  closable?: boolean
}

export interface GlassToastProps {
  position?: GlassToastPosition
  /** Newest toasts past this many push the oldest out. 0 keeps every one. */
  max?: number
  closeLabel?: string
}

export interface GlassCommand {
  id: string
  label: string
  /** Extra words the search should match, beyond the label. */
  keywords?: string[]
  /** Rendered as a GlassKbd beside the entry. */
  shortcut?: string
  group?: string
  disabled?: boolean
}

export interface GlassCommandPaletteProps {
  modelValue?: boolean
  commands: GlassCommand[]
  /** Keyboard shortcut that opens it. 'mod' is Meta on Apple, Control elsewhere. */
  hotkey?: string
  placeholder?: string
  noResultsLabel?: string
  /** Accessible name of the palette. */
  label?: string
}
