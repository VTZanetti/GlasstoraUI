import type { ComputedRef, InjectionKey, Ref } from 'vue'

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

export const lightKey: InjectionKey<GlassLight> = Symbol('gt-light')
export const configKey: InjectionKey<GlassConfig> = Symbol('gt-config')
export const fieldKey: InjectionKey<GlassFieldContext> = Symbol('gt-field')
