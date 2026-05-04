import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Player from '../../src/components/player/Player.vue'
import { useSongStore } from '../../src/store/useSongStore'

/**
 * Unit test suite for the Player.vue component.
 * Validates reactive song state rendering and UI-to-Store action dispatching.
 */
const vuetify = createVuetify({ components, directives })

describe('Player.vue', () => {
    let pinia
    let store

    /**
     * Factory function for component instantiation.
     * Implements VAppBar stubbing to bypass Vuetify layout injection requirements.
     */
    const createWrapper = () => {
        return mount(Player, {
            global: {
                plugins: [pinia, vuetify],
                stubs: {
                    VAppBar: { template: '<div class="v-app-bar-stub"><slot /></div>' }
                }
            }
        })
    }

    beforeEach(() => {
        /**
         * Context initialization.
         * Resets Pinia state and populates the store with mock track metadata.
         */
        pinia = createPinia()
        setActivePinia(pinia)
        store = useSongStore()

        store.songs = [
            { trackId: 1, trackName: 'Test Song', artistName: 'Test Artist', artworkUrl: 'test.jpg' }
        ]
    })

    it('renders null state when currentSongId is undefined', () => {
        store.currentSongId = null
        const wrapper = createWrapper()

        // Assert absence of the player interface based on conditional v-if logic.
        expect(wrapper.find('.v-app-bar-stub').exists()).toBe(false)
    })

    it('populates song metadata when a track is active', () => {
        store.currentSongId = 1
        const wrapper = createWrapper()

        // Validate text content synchronization with store state.
        expect(wrapper.text()).toContain('Test Song')
    })

    it('invokes store.togglePlay upon play/pause interaction', async () => {
        store.currentSongId = 1
        const spy = vi.spyOn(store, 'togglePlay')
        const wrapper = createWrapper()

        // Locate action button via variant-specific selector and trigger DOM event.
        const playBtn = wrapper.find('.v-btn--variant-tonal')
        await playBtn.trigger('click')

        // Assert store method invocation with the active song object as payload.
        expect(spy).toHaveBeenCalledWith(store.songs[0])
    })

    it('dispatches navigation actions for sequential playback control', async () => {
        store.currentSongId = 1
        const nextSpy = vi.spyOn(store, 'next')
        const prevSpy = vi.spyOn(store, 'prev')
        const wrapper = createWrapper()

        const buttons = wrapper.findAll('.v-btn--variant-text')

        // Sequential validation of 'Previous' and 'Next' button triggers.
        await buttons[0].trigger('click')
        expect(prevSpy).toHaveBeenCalled()

        await buttons[1].trigger('click')
        expect(nextSpy).toHaveBeenCalled()
    })

    it('executes store.seek upon progression slider adjustment', async () => {
        store.currentSongId = 1
        const seekSpy = vi.spyOn(store, 'seek')
        const wrapper = createWrapper()

        /**
         * Emulated component event.
         * Directly emits the Vuetify update event to bypass JSDOM slider limitations.
         */
        const slider = wrapper.findComponent({ name: 'VSlider' })
        await slider.vm.$emit('update:model-value', 15)

        expect(seekSpy).toHaveBeenCalledWith(15)
    })
})