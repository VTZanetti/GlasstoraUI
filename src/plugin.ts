import type { App, Component, Plugin } from 'vue'
import { vGlass } from './directives/glass'
import { configureLight, type LightTuning } from './internal/lightRegistry'

import GlassProvider from './components/GlassProvider.vue'
import GlassSurface from './components/GlassSurface.vue'
import GlassCard from './components/GlassCard.vue'
import GlassDivider from './components/GlassDivider.vue'
import GlassButton from './components/GlassButton.vue'
import GlassInput from './components/GlassInput.vue'
import GlassTextarea from './components/GlassTextarea.vue'
import GlassField from './components/GlassField.vue'
import GlassCheckbox from './components/GlassCheckbox.vue'
import GlassSwitch from './components/GlassSwitch.vue'
import GlassRadio from './components/GlassRadio.vue'
import GlassRadioGroup from './components/GlassRadioGroup.vue'
import GlassSlider from './components/GlassSlider.vue'
import GlassTabs from './components/GlassTabs.vue'
import GlassTabPanel from './components/GlassTabPanel.vue'
import GlassAccordion from './components/GlassAccordion.vue'
import GlassBreadcrumb from './components/GlassBreadcrumb.vue'
import GlassPagination from './components/GlassPagination.vue'
import GlassTable from './components/GlassTable.vue'
import GlassKbd from './components/GlassKbd.vue'
import GlassBadge from './components/GlassBadge.vue'
import GlassAvatar from './components/GlassAvatar.vue'
import GlassSpinner from './components/GlassSpinner.vue'
import GlassSkeleton from './components/GlassSkeleton.vue'
import GlassProgress from './components/GlassProgress.vue'
import GlassAlert from './components/GlassAlert.vue'
import GlassTooltip from './components/GlassTooltip.vue'
import GlassPopover from './components/GlassPopover.vue'
import GlassModal from './components/GlassModal.vue'
import GlassTerminal from './components/GlassTerminal.vue'

/** Every component in the catalogue, keyed by its default name. */
export const components: Record<string, Component> = {
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
  GlassRadio,
  GlassRadioGroup,
  GlassSlider,
  GlassTabs,
  GlassTabPanel,
  GlassAccordion,
  GlassBreadcrumb,
  GlassPagination,
  GlassTable,
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
}

export interface GlasstoraOptions {
  /** Replaces the leading "Glass" in every registered name. */
  prefix?: string
  /** false registers nothing, an object registers exactly what it contains. */
  components?: boolean | Record<string, Component>
  /** Registers v-glass. On by default. */
  directive?: boolean
  /** Applied to the shared light tuning at install time. */
  light?: Partial<LightTuning>
}

/**
 * Registers the whole catalogue globally.
 *
 *   app.use(Glasstora)
 *   app.use(Glasstora, { prefix: 'Gt' })
 *
 * Installing it pulls in every component by definition, which is the trade for
 * not writing imports. Anyone who cares about bundle size should keep using
 * named imports, or reach for the unplugin resolver at glasstora/resolver.
 */
export const Glasstora: Plugin<[GlasstoraOptions?]> = {
  install(app: App, options: GlasstoraOptions = {}) {
    const prefix = options.prefix ?? 'Glass'
    const requested = options.components ?? true

    if (requested !== false) {
      const set = requested === true ? components : requested
      for (const [name, component] of Object.entries(set)) {
        app.component(prefix === 'Glass' ? name : name.replace(/^Glass/, prefix), component)
      }
    }

    if (options.directive !== false) app.directive('glass', vGlass)
    if (options.light) configureLight(options.light)
  },
}
