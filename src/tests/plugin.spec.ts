import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { Glasstora, components, type GlasstoraOptions } from '../plugin'
import { GlasstoraResolver } from '../resolver'

function install(options?: GlasstoraOptions) {
  const app = createApp({ render: () => null })
  app.use(Glasstora, options)
  return app
}

describe('Glasstora plugin', () => {
  it('registers every component through app.use', () => {
    const app = install()
    for (const name of Object.keys(components)) {
      expect(app.component(name), name).toBeTruthy()
    }
  })

  it('honours the prefix option', () => {
    const app = install({ prefix: 'Gt' })
    expect(app.component('GtButton')).toBeTruthy()
    expect(app.component('GlassButton')).toBeUndefined()
  })

  it('registers the v-glass directive', () => {
    expect(install().directive('glass')).toBeTruthy()
  })

  it('skips the directive when asked', () => {
    expect(install({ directive: false }).directive('glass')).toBeUndefined()
  })

  it('registers only the components it is handed', () => {
    const app = install({ components: { GlassButton: components.GlassButton } })
    expect(app.component('GlassButton')).toBeTruthy()
    expect(app.component('GlassModal')).toBeUndefined()
  })
})

describe('GlasstoraResolver', () => {
  it('resolves Glass prefixed names to the package entry', () => {
    const resolved = GlasstoraResolver().resolve('GlassCard')
    expect(resolved).toEqual({
      name: 'GlassCard',
      from: 'glasstora',
      sideEffects: ['glasstora/css/base.css', 'glasstora/css/GlassCard.css'],
    })
  })

  it('puts the base first, so the layer takes its position from it', () => {
    expect(GlasstoraResolver().resolve('GlassModal')?.sideEffects?.[0]).toBe(
      'glasstora/css/base.css',
    )
  })

  it('pulls in the stylesheet of a component rendered inside another', () => {
    expect(GlasstoraResolver().resolve('GlassButton')?.sideEffects).toEqual([
      'glasstora/css/base.css',
      'glasstora/css/GlassSpinner.css',
      'glasstora/css/GlassButton.css',
    ])
  })

  it('falls back to the single stylesheet when asked', () => {
    expect(GlasstoraResolver({ css: 'bundle' }).resolve('GlassButton')).toEqual({
      name: 'GlassButton',
      from: 'glasstora',
      sideEffects: ['glasstora/style.css'],
    })
  })

  it('ignores unrelated component names', () => {
    expect(GlasstoraResolver().resolve('MyButton')).toBeUndefined()
    expect(GlasstoraResolver().resolve('Glassdoor')).toBeUndefined()
  })

  it('maps a custom prefix back to the published name', () => {
    const resolved = GlasstoraResolver({ prefix: 'Gt' }).resolve('GtButton')
    expect(resolved?.name).toBe('GlassButton')
    // The stylesheet is named after the export, not after what the template said.
    expect(resolved?.sideEffects).toContain('glasstora/css/GlassButton.css')
  })

  it('names a stylesheet for every component it can resolve', () => {
    for (const name of Object.keys(components)) {
      expect(GlasstoraResolver().resolve(name)?.sideEffects, name).toContain(
        `glasstora/css/${name}.css`,
      )
    }
  })
})
