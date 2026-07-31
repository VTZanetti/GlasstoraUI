import { afterEach } from 'vitest'
import { installTestDoubles } from './doubles'
import { resetToasts } from '../composables/useToast'
import { resetScrollLock } from '../internal/scrollLock'

// jsdom implements neither matchMedia nor the observers the light engine uses,
// and its requestAnimationFrame cannot be stepped. The doubles replace all of
// them with versions a test can drive.
installTestDoubles()

// The toast queue and the scroll lock both live in module scope, so a case that
// leaves one behind would arrive in the next one as a ghost.
afterEach(() => {
  resetToasts()
  resetScrollLock()
})
