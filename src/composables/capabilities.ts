export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(pointer: coarse)').matches
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

interface NavigatorUAData {
  brands: { brand: string; version: string }[]
}

/**
 * Reports whether `backdrop-filter: url(#...)` actually renders.
 *
 * A plain `@supports` check is not enough: Safari parses the declaration and
 * then paints nothing. The reliable gate is valid syntax plus a Chromium
 * engine.
 */
export function detectRefraction(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof CSS === 'undefined' || !CSS.supports?.('backdrop-filter', 'url(#x)')) return false
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData
  if (uaData?.brands) return uaData.brands.some((b) => b.brand === 'Chromium')
  const m = navigator.userAgent.match(/Chrome\/(\d+)/)
  return !!m && Number(m[1]) >= 120
}
