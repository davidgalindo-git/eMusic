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
        const wrapper = createWrapper()
        expect(wrapper.find('.v-app-bar-stub').exists()).toBe(false)
    })

    it('renders song details when a song is active', () => {
        store.currentSongId = 1
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('Test Song')
    })

    it('calls store.togglePlay when the play/pause button is clicked', async () => {
        store.currentSongId = 1
        const spy = vi.spyOn(store, 'togglePlay')
        const wrapper = createWrapper()

        const playBtn = wrapper.find('.v-btn--variant-tonal')
        await playBtn.trigger('click')

        expect(spy).toHaveBeenCalledWith(store.songs[0])
    })

    it('triggers next and prev actions', async () => {
        store.currentSongId = 1
        const nextSpy = vi.spyOn(store, 'next')
        const prevSpy = vi.spyOn(store, 'prev')
        const wrapper = createWrapper()

        const buttons = wrapper.findAll('.v-btn--variant-text')

        await buttons[0].trigger('click') // Prev
        expect(prevSpy).toHaveBeenCalled()

        await buttons[1].trigger('click') // Next
        expect(nextSpy).toHaveBeenCalled()
    })

    it('calls store.seek when the slider is moved', async () => {
        store.currentSongId = 1
        const seekSpy = vi.spyOn(store, 'seek')
        const wrapper = createWrapper()

        const slider = wrapper.findComponent({ name: 'VSlider' })
        await slider.vm.$emit('update:model-value', 15)

        expect(seekSpy).toHaveBeenCalledWith(15)
    })
})