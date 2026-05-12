import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import {VImg} from "vuetify/components";
import * as directives from 'vuetify/directives'
import SongCard from '../../src/components/songs/SongCard.vue'

/**
 * Unit test suite for the SongCard.vue component.
 * Validates atomic rendering based on injected properties (props).
 */
const vuetify = createVuetify({ components, directives })

describe('SongCard.vue - Unit Rendering', () => {
    /**
     * Mock dataset configuration.
     * Compliant with the domain-specific track interface.
     */
    const mockSong = {
        trackName: 'Test Song',
        artistName: 'Test Artist',
        artworkUrl: 'https://example.com/image.jpg'
    }

    it('should render track metadata in v-card', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: { plugins: [vuetify], stubs: { AddToPlaylistButton: true } }
        })

        const title = wrapper.find('.v-card-title')
        const subtitle = wrapper.find('.v-card-subtitle')

        expect(title.text()).toBe(mockSong.trackName)
        expect(subtitle.text()).toBe(mockSong.artistName)
    })

    it('should bind the correct source URL to the v-img component', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: {
                plugins: [vuetify],
                stubs: { AddToPlaylistButton: true }
            }
        })

        // Find the Vuetify component instance
        const vImg = wrapper.findComponent(VImg)

        // Check the 'src' prop specifically
        expect(vImg.props('src')).toBe(mockSong.artworkUrl)
    })

    it('should assign the designated stylistic class to the component root', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: {
                plugins: [vuetify],
                stubs: {
                    AddToPlaylistButton: true
                }
            }
        })

        expect(wrapper.classes()).toContain('song-card')
    })
})