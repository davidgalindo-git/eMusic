import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Player from '../../src/components/player/Player.vue'
import { useSongStore } from '../../src/store/useSongStore'

// 1. Initialize Vuetify
const vuetify = createVuetify({ components, directives })

describe('Player.vue', () => {
    let pinia
    let store

    beforeEach(() => {
        // 2. Setup Pinia for each test
        pinia = createPinia()
        setActivePinia(pinia)
        store = useSongStore()

        // Mock the initial state
        store.songs = [
            { trackId: 1, trackName: 'Test Song', artistName: 'Test Artist', artworkUrl: 'test.jpg' }
        ]
    })

    it('renders nothing when no song is selected', () => {
        store.currentSongId = null
        const wrapper = mount(Player, {
            global: { plugins: [pinia, vuetify] }
        })
        // v-app-bar is not rendered if "song" is undefined
        expect(wrapper.find('.v-app-bar').exists()).toBe(false)
    })

    it('renders song details when a song is active', () => {
        store.currentSongId = 1

        const wrapper = mount(Player,{
            global: {
                plugins: [pinia, vuetify],
                stubs: {
                    VAppBar: { template: '<div class="stubbed-bar"><slot /></div>' }
                }
            }
        })

        expect(wrapper.text()).toContain('Test Song')
    })

    it('calls store.togglePlay when the play/pause button is clicked', async () => {
        store.currentSongId = 1
        const spy = vi.spyOn(store, 'togglePlay')
        const wrapper = mount(Player, {
            global: { plugins: [pinia, vuetify] }
        })

        // Find the Play/Pause button (the one with variant="tonal")
        const playBtn = wrapper.find('.v-btn--variant-tonal')
        await playBtn.trigger('click')

        expect(spy).toHaveBeenCalledWith(store.songs[0])
    })

    it('triggers next and prev actions', async () => {
        store.currentSongId = 1
        const nextSpy = vi.spyOn(store, 'next')
        const prevSpy = vi.spyOn(store, 'prev')

        const wrapper = mount(Player, {
            global: { plugins: [pinia, vuetify] }
        })

        const buttons = wrapper.findAll('.v-btn--variant-text') // Skip prev/next buttons

        await buttons[0].trigger('click') // Prev
        expect(prevSpy).toHaveBeenCalled()

        await buttons[1].trigger('click') // Next
        expect(nextSpy).toHaveBeenCalled()
    })

    it('calls store.seek when the slider is moved', async () => {
        store.currentSongId = 1
        const seekSpy = vi.spyOn(store, 'seek')
        const wrapper = mount(Player, {
            global: { plugins: [pinia, vuetify] }
        })

        const slider = wrapper.findComponent({ name: 'VSlider' })
        // Simulate Vuetify's slider update event
        await slider.vm.$emit('update:model-value', 15)

        expect(seekSpy).toHaveBeenCalledWith(15)
    })
})