import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ErrorAlert from '../../src/components/ErrorAlert.vue'
import { useSongStore } from '../../src/store/useSongStore.js'

/**
 * Technical Specification: ErrorAlert.vue Unit Test Suite
 * Validates the Reactive Interconnect between the Global Store State and the Alert UI Layer.
 * Ensures strict adherence to conditional rendering and state-clearing side effects.
 */

// Global UI Hardware Initialization (Vuetify Layer)
const vuetify = createVuetify({ components, directives })

describe('ErrorAlert.vue', () => {

    /**
     * Context Isolation: Resetting the Pinia instance before each cycle
     * prevents cross-test state leakage and ensures a clean slate for the Aggregate Root.
     */
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('should be hidden when there is no error in the store', () => {
        /**
         * State Logic: Null Equilibrium.
         * Verifies that the component maintains a 'Hidden' state when the
         * 'error' primitive in the store is null.
         */
        const wrapper = mount(ErrorAlert, {
            global: { plugins: [vuetify] }
        })

        // Asserting the absence of the alert component in the DOM tree.
        expect(wrapper.find('.v-alert').exists()).toBe(false)
    })

    it('should display the error message when an error exists', async () => {
        /**
         * State Transition: Hydration from Store.
         * Manually injecting an error string to simulate a failed API resolution.
         */
        const store = useSongStore()
        const errorMessage = 'Network Timeout: Could not reach iTunes'

        // Manual State Mutation for isolation testing
        store.error = errorMessage

        const wrapper = mount(ErrorAlert, {
            global: { plugins: [vuetify] }
        })

        /**
         * UI Validation: Synchronous Content Projection.
         * Ensures the DOM reflects the string currently held in the reactive store state.
         */
        expect(wrapper.find('.v-alert').exists()).toBe(true)
        expect(wrapper.text()).toContain(errorMessage)
    })

    it('should clear the store error when the close button is clicked', async () => {
        /**
         * Logic Verification: Reactive Feedback Loop.
         * Simulates user interaction with the 'Close' signal to trigger a state reset.
         */
        const store = useSongStore()
        store.error = 'Temporary Error'

        const wrapper = mount(ErrorAlert, {
            global: { plugins: [vuetify] }
        })

        /**
         * Interaction: Event Delegation.
         * Locating the synthesized close button within the Vuetify VAlert structure
         * and triggering the delegated 'click' event.
         */
        const closeBtn = wrapper.find('.v-alert__close .v-btn')
        await closeBtn.trigger('click')

        /**
         * Post-Condition: State Purge.
         * Validates that the store's error state has been returned to Null Equilibrium
         * as a direct result of the component's internal close logic.
         */
        expect(store.error).toBeNull()
    })
})