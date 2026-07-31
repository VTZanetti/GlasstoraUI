import './styles/index.css'

export { default as GlassProvider } from './components/GlassProvider.vue'
export { default as GlassSurface } from './components/GlassSurface.vue'
export { default as GlassCard } from './components/GlassCard.vue'
export { default as GlassDivider } from './components/GlassDivider.vue'
export { default as GlassButton } from './components/GlassButton.vue'
export { default as GlassInput } from './components/GlassInput.vue'
export { default as GlassTextarea } from './components/GlassTextarea.vue'
export { default as GlassField } from './components/GlassField.vue'
export { default as GlassCheckbox } from './components/GlassCheckbox.vue'
export { default as GlassSwitch } from './components/GlassSwitch.vue'
export { default as GlassRadio } from './components/GlassRadio.vue'
export { default as GlassRadioGroup } from './components/GlassRadioGroup.vue'
export { default as GlassSlider } from './components/GlassSlider.vue'
export { default as GlassSelect } from './components/GlassSelect.vue'
export { default as GlassCombobox } from './components/GlassCombobox.vue'
export { default as GlassMenu } from './components/GlassMenu.vue'
export { default as GlassTabs } from './components/GlassTabs.vue'
export { default as GlassTabPanel } from './components/GlassTabPanel.vue'
export { default as GlassAccordion } from './components/GlassAccordion.vue'
export { default as GlassBreadcrumb } from './components/GlassBreadcrumb.vue'
export { default as GlassPagination } from './components/GlassPagination.vue'
export { default as GlassTable } from './components/GlassTable.vue'
export { default as GlassKbd } from './components/GlassKbd.vue'
export { default as GlassBadge } from './components/GlassBadge.vue'
export { default as GlassAvatar } from './components/GlassAvatar.vue'
export { default as GlassSpinner } from './components/GlassSpinner.vue'
export { default as GlassSkeleton } from './components/GlassSkeleton.vue'
export { default as GlassProgress } from './components/GlassProgress.vue'
export { default as GlassAlert } from './components/GlassAlert.vue'
export { default as GlassTooltip } from './components/GlassTooltip.vue'
export { default as GlassPopover } from './components/GlassPopover.vue'
export { default as GlassModal } from './components/GlassModal.vue'
export { default as GlassDrawer } from './components/GlassDrawer.vue'
export { default as GlassToast } from './components/GlassToast.vue'
export { default as GlassCommandPalette } from './components/GlassCommandPalette.vue'
export { default as GlassTerminal } from './components/GlassTerminal.vue'

export { useToast, type UseToastReturn, type ToastEntry } from './composables/useToast'
export { useGlassLight } from './composables/useGlassLight'
export { useGlassConfig } from './composables/useGlassConfig'
export { useGlassSurface } from './composables/useGlassSurface'
export {
  detectRefraction,
  prefersReducedMotion,
  hasCoarsePointer,
  isIOS,
} from './composables/capabilities'

export { vGlass } from './directives/glass'
export { Glasstora, type GlasstoraOptions } from './plugin'

export { configureLight, getLightTuning, surfaceCount } from './internal/lightRegistry'
export type {
  LightTuning,
  SurfaceLight,
  RegisterOptions,
  SurfaceHandle,
} from './internal/lightRegistry'
export type { UseGlassSurfaceOptions, UseGlassSurfaceReturn } from './composables/useGlassSurface'
export type { GlassDirectiveValue } from './directives/glass'

export type { GlassLight, GlassLightMode, GlassConfig } from './internal/keys'
export type {
  GlassSize,
  GlassRadius,
  GlassElevation,
  GlassTheme,
  GlassPlacement,
  GlassProviderProps,
  GlassSurfaceProps,
  GlassCardProps,
  GlassDividerProps,
  GlassButtonProps,
  GlassInputProps,
  GlassTextareaProps,
  GlassFieldProps,
  GlassCheckboxProps,
  GlassSwitchProps,
  GlassRadioProps,
  GlassRadioGroupProps,
  GlassSliderProps,
  GlassSelectProps,
  GlassSelectOption,
  GlassComboboxProps,
  GlassMenuProps,
  GlassMenuItem,
  GlassMenuSeparator,
  GlassMenuEntry,
  GlassTabsProps,
  GlassTabPanelProps,
  GlassTabItem,
  GlassAccordionProps,
  GlassAccordionItem,
  GlassBreadcrumbProps,
  GlassBreadcrumbItem,
  GlassPaginationProps,
  GlassTableProps,
  GlassTableColumn,
  GlassSortState,
  GlassBadgeProps,
  GlassAvatarProps,
  GlassSpinnerProps,
  GlassSkeletonProps,
  GlassProgressProps,
  GlassAlertProps,
  GlassTooltipProps,
  GlassPopoverProps,
  GlassModalProps,
  GlassDrawerProps,
  GlassDrawerSide,
  GlassToastProps,
  GlassToastOptions,
  GlassToastVariant,
  GlassToastPosition,
  GlassCommandPaletteProps,
  GlassCommand,
  GlassTerminalProps,
} from './types'

export { VERSION } from './internal/version'
