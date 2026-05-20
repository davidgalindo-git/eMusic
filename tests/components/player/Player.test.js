import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Player from '../../../src/components/player/Player.vue'
import { useSongStore } from '../../../src/store/useSongStore.js'

const vuetify = createVuetify({ components, directives })

describe('Player.vue', () => {
    let pinia
    let store

    const createWrapper = () => {
        return mount(Player, {
            global: {
                plugins: [pinia, vuetify],
                stubs: {
                    VFooter: { template: '<div class="v-footer-stub"><slot /></div>' }
                },
                mocks: {
                    $vuetify: { display: { xs: false } }
                }
            }
        })
    }

    beforeEach(() => {
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

        expect(wrapper.find('.v-footer-stub').exists()).toBe(false)
    })

    it('populates song metadata when a track is active', () => {
        store.currentSongId = 1
        const wrapper = createWrapper()

        expect(wrapper.text()).toContain('Test Song')
        expect(wrapper.text()).toContain('Test Artist')
    })

    it('invokes store.togglePlay upon play/pause interaction', async () => {
        store.currentSongId = 1
        const spy = vi.spyOn(store, 'togglePlay')
        const wrapper = createWrapper()

        const playBtn = wrapper.find('.v-btn--variant-tonal')
        await playBtn.trigger('click')

        expect(spy).toHaveBeenCalledWith(store.songs[0])
    })

    it('dispatches navigation actions for sequential playback control', async () => {
        store.currentSongId = 1
        const nextSpy = vi.spyOn(store, 'next')
        const prevSpy = vi.spyOn(store, 'prev')
        const wrapper = createWrapper()

        const prevBtnEl = wrapper.find('.mdi-skip-previous').element.closest('button')
        const nextBtnEl = wrapper.find('.mdi-skip-next').element.closest('button')

        expect(prevBtnEl).not.toBeNull()
        expect(nextBtnEl).not.toBeNull()

        // Trigger clicks on the native DOM nodes directly
        await prevBtnEl.click()
        expect(prevSpy).toHaveBeenCalled()

        await nextBtnEl.click()
        expect(nextSpy).toHaveBeenCalled()
    })

    it('executes store.seek upon progression slider adjustment', async () => {
        store.currentSongId = 1
        const seekSpy = vi.spyOn(store, 'seek')
        const wrapper = createWrapper()

        const slider = wrapper.findComponent({ name: 'VSlider' })
        await slider.vm.$emit('update:model-value', 15)

        expect(seekSpy).toHaveBeenCalledWith(15)
    })
})