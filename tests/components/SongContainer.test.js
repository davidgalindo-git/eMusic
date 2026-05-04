import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SongContainer from '../../src/components/songs/SongContainer.vue'
import { useSongStore } from '../../src/store/useSongStore'

/**
 * Integration test suite for SongContainer.vue.
 * Evaluates conditional rendering logic driven by the reactive Pinia store state.
 */
const vuetify = createVuetify({ components, directives })

describe('SongContainer.vue - Dynamic Rendering', () => {
    beforeEach(() => {
        /**
         * Pinia context initialization.
         * Establishes an isolated store instance to prevent cross-test state leakage.
         */
        setActivePinia(createPinia())
    })

    it('should display "No songs found" when the collection state is empty', async () => {
        const store = useSongStore()

        store.songs = []
        store.loading = false
        store.collectionName = 'Empty Results'

        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        // Assert text exists in the DOM
        expect(wrapper.text()).toContain('No songs found')

        // Assert the "Empty" icon is rendered
        expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('should instantiate SongCard components proportional to store data length', async () => {
        const store = useSongStore()

        /**
         * Mock state injection.
         * Populates the store with a controlled dataset.
         */
        store.songs = [
            { trackId: 1, trackName: 'Song 1', artistName: 'Artist 1' },
            { trackId: 2, trackName: 'Song 2', artistName: 'Artist 2' }
        ]

        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        // Identify child component instances within the DOM tree.
        const cards = wrapper.findAllComponents({ name: 'SongCard' })

        // Assert list rendering integrity and suppression of empty-state UI.
        expect(cards).toHaveLength(2)
        expect(wrapper.text()).not.toContain('No songs found')
    })

    it('should verify the presence of responsive grid components (VRow and VCol)', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1, trackName: 'Song 1' }]

        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        /**
         * Layout engine validation.
         * Confirms utilization of Vuetify grid system components.
         */
        expect(wrapper.findComponent({ name: 'VRow' }).exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'VCol' }).exists()).toBe(true)
    })
})