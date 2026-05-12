import ResizeObserver from 'resize-observer-polyfill'
import { vi } from 'vitest'

/**
 * @polyfill ResizeObserver
 * @description Vuetify components (VApp, VSlider) utilize ResizeObserver for
 * dynamic dimension calculations. Since JSDOM lacks a native implementation,
 * this polyfill prevents "ReferenceError: ResizeObserver is not defined".
 */
global.ResizeObserver = ResizeObserver

/**
 * @mock VisualViewport
 * @description Modern UI frameworks (Vuetify) and utilities (VueDraggable)
 * rely on the VisualViewport API to handle positioning logic, specifically
 * for mobile keyboard offsets and zoom scaling.
 * * JSDOM does not yet implement this BOM API, leading to ReferenceErrors
 * during component mounting even if not explicitly invoked by application code.
 */
if (typeof window !== 'undefined' && !window.visualViewport) {
    window.visualViewport = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        width: 1280,
        height: 1024,
        scale: 1,
        offsetTop: 0,
        offsetLeft: 0,
        pageTop: 0,
        pageLeft: 0,
    }
}