import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { GlassSize } from '../types'

export type GlassLightMode = 'pointer' | 'drift' | 'static'

export interface GlassLight {
  /** Light position in viewport pixels. */
  x: Readonly<Ref<number>>
  y: Readonly<Ref<number>>
  mode: Readonly<Ref<GlassLightMode>>
  /** Moves the light manually and suspends the automatic mode. */
  set: (x: number, y: number) => void
  /** Hands control back to the automatic mode. */
  resume: () => void
}

export interface GlassConfig {
  grain: boolean
  refraction: 'auto' | 'on' | 'off'
  theme: 'dark' | 'light' | 'auto'
}

/** What GlassField hands down to whatever control sits inside it. */
export interface GlassFieldContext {
  id: ComputedRef<string>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
}

/** What GlassRadioGroup hands down to the radios inside it. */
export interface GlassRadioGroupContext {
  value: ComputedRef<string | number | undefined>
  select: (value: string | number) => void
  name: ComputedRef<string | undefined>
  size: ComputedRef<GlassSize>
  disabled: ComputedRef<boolean>
}

/** What GlassTabs hands down to the panels inside it. */
export interface GlassTabsContext {
  active: ComputedRef<string | undefined>
  /** Prefix both halves of a pair share, so ids can be derived rather than registered. */
  groupId: string
  panelId: (value: string) => string
  tabId: (value: string) => string
}

export const lightKey: InjectionKey<GlassLight> = Symbol('gt-light')
export const configKey: InjectionKey<GlassConfig> = Symbol('gt-config')
export const fieldKey: InjectionKey<GlassFieldContext> = Symbol('gt-field')
export const radioGroupKey: InjectionKey<GlassRadioGroupContext> = Symbol('gt-radio-group')
export const tabsKey: InjectionKey<GlassTabsContext> = Symbol('gt-tabs')
