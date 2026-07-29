import { installTestDoubles } from './doubles'

// jsdom implements neither matchMedia nor the observers the light engine uses,
// and its requestAnimationFrame cannot be stepped. The doubles replace all of
// them with versions a test can drive.
installTestDoubles()
