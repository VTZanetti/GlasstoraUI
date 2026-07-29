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
    const resolved = GlasstoraResolver().resolve('GlassButton')
    expect(resolved).toEqual({
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
    expect(GlasstoraResolver({ prefix: 'Gt' }).resolve('GtButton')?.name).toBe('GlassButton')
  })
})
