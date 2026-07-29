/**
 * Global component types, for templates that use the components without
 * importing them (via app.use(Glasstora) or unplugin-vue-components).
 *
 * Opt in, because it is not free: pulling twenty one names into every template's
 * scope is wrong for a project that imports what it uses. Reference it from a
 * .d.ts in your own project:
 *
 *   /// <reference types="glasstora/global" />
 *
 * or add "glasstora/global" to compilerOptions.types.
 */
import type {
  GlassProvider,
  GlassSurface,
  GlassCard,
  GlassDivider,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassField,
  GlassCheckbox,
  GlassSwitch,
  GlassKbd,
  GlassBadge,
  GlassAvatar,
  GlassSpinner,
  GlassSkeleton,
  GlassProgress,
  GlassAlert,
  GlassTooltip,
  GlassPopover,
  GlassModal,
  GlassTerminal,
  vGlass,
} from './index'

declare module 'vue' {
  export interface GlobalComponents {
    GlassProvider: typeof GlassProvider
    GlassSurface: typeof GlassSurface
    GlassCard: typeof GlassCard
    GlassDivider: typeof GlassDivider
    GlassButton: typeof GlassButton
    GlassInput: typeof GlassInput
    GlassTextarea: typeof GlassTextarea
    GlassField: typeof GlassField
    GlassCheckbox: typeof GlassCheckbox
    GlassSwitch: typeof GlassSwitch
    GlassKbd: typeof GlassKbd
    GlassBadge: typeof GlassBadge
    GlassAvatar: typeof GlassAvatar
    GlassSpinner: typeof GlassSpinner
    GlassSkeleton: typeof GlassSkeleton
    GlassProgress: typeof GlassProgress
    GlassAlert: typeof GlassAlert
    GlassTooltip: typeof GlassTooltip
    GlassPopover: typeof GlassPopover
    GlassModal: typeof GlassModal
    GlassTerminal: typeof GlassTerminal
  }

  export interface GlobalDirectives {
    vGlass: typeof vGlass
  }
}

export {}
