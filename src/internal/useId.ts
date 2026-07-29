import { getCurrentInstance } from 'vue'

let fallback = 0

/**
 * A stable id for wiring aria attributes between two elements of the same
 * component.
 *
 * Vue grew a useId() of its own in 3.5, but the peer range starts at 3.4 and
 * raising it would break anyone still on that line. Importing a name that does
 * not exist in 3.4 fails at module link time, so there is no safe way to
 * feature detect it either. The instance uid is assigned in render order, which
 * is the same on the server and on the client, so it holds up through
 * hydration the same way.
 */
export function useGlassId(prefix = 'gt'): string {
  const instance = getCurrentInstance()
  return `${prefix}-${instance ? instance.uid : ++fallback}`
}
