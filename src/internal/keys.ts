import type { InjectionKey, Ref } from 'vue'

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
}

export const lightKey: InjectionKey<GlassLight> = Symbol('gt-light')
export const configKey: InjectionKey<GlassConfig> = Symbol('gt-config')
