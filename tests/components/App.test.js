import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from '../../src/App.vue'
import { useSongStore } from '../../src/store/useSongStore'

/**
 * Integration test suite for the root App.vue component.
 * Evaluates inter-component communication and Pinia store state synchronization.
 */
const vuetify = createVuetify({ components, directives })

describe('App.vue - Integration', () => {
    let pinia

    beforeEach(() => {
        /**
         * Global state isolation.
         * Ensures a fresh Pinia instance is active prior to each execution cycle.
         */
        pinia = createPinia()
        setActivePinia(pinia)
    })

    it('should successfully mount the component with global plugins', () => {
        const wrapper = mount(App, {
            global: {
                plugins: [pinia, vuetify]
            }
        })

        // Assert component instantiation and presence in the virtual DOM.
        expect(wrapper.exists()).toBe(true)
    })

    it('should trigger the store search action upon SearchBar event emission', async () => {
        /**
         * Component tree mounting with dependency injection.
         */
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify, pinia]
            }
        })

        /**
         * Store action interception.
         * Spies on the 'search' method to validate upward data flow.
         */
        const store = useSongStore()
        const searchSpy = vi.spyOn(store, 'search').mockImplementation(() => Promise.resolve())

        /**
         * Event-driven interaction simulation.
         * Manually triggers the custom 'search' event from the child component.
         */
        const searchBar = wrapper.findComponent({ name: 'SearchBar' })
        await searchBar.vm.$emit('search', 'Daft Punk')

        // Assert that the upward data flow (Child -> Root -> Store) is intact.
        expect(searchSpy).toHaveBeenCalledWith('Daft Punk')
    })

    it('should verify the existence of core structural components upon initialization', () => {
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify, pinia],
                /**
                 * Component stubbing.
                 * Isolates structural layout by bypassing heavy downstream rendering (e.g., Player).
                 */
                stubs: {
                    Player: true
                }
            }
        })

        // Verify the structural integrity of the application layout.
        expect(wrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'SongContainer' }).exists()).toBe(true)
    })
})