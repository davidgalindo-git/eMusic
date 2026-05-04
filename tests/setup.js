import { vi } from 'vitest'
import ResizeObserver from 'resize-observer-polyfill'

/**
 * Technical Note:
 * Vuetify components like VApp and VSlider use ResizeObserver
 * to calculate dimensions. Since JSDOM doesn't support it,
 * this polyfill prevents "ReferenceError: ResizeObserver is not defined".
 */
// Set the polyfill on the global object for JSDOM
global.ResizeObserver = ResizeObserver